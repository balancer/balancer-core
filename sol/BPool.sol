// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.5.11;

import "./BColor.sol";
import "./BToken.sol";
import "./BMath.sol";

contract BPool is BBronze, BToken, BMath
{
    struct Record {
        uint index;
        uint weight;
        uint balance;
    }

    event LOG_SWAP( address indexed caller
                  , address indexed tokenIn
                  , address indexed tokenOut
                  , uint256         amountIn
                  , uint256         amountOut );

    event LOG_CALL( bytes4  indexed sig
                  , address indexed caller
                  , bytes           data
                  ) anonymous;

    modifier _beep_() {
        emit LOG_CALL(msg.sig, msg.sender, msg.data);
        _;
    }

    modifier _lock_() {
        require( !_mutex, ERR_REENTRY);
        _mutex = true;
        _;
        _mutex = false;
    }

    modifier _view_() {
        require( !_mutex, ERR_REENTRY);
        _;
    }

    bool                      _mutex;

    bool                      _paused;
    bool                      _finalized;

    address                   _factory;
    address                   _manager;

    uint                      _swapFee;
    uint                      _exitFee;

    address[]                 _index;
    mapping(address=>Record)  _records;
    uint                      _totalWeight;

    constructor() public {
        _paused = true;
        _finalized = false;
        _manager = msg.sender;
        _factory = msg.sender;
    }

    function getManager()
      public view returns (address) {
        return _manager;
    }

    function isPaused()
      public view returns (bool) {
        return _paused;
    }

    function isBound(address t) public view returns (bool) {
        return _records[t].weight != 0;
    }

    function isFinalized()
      public view returns (bool) {
        return _finalized;
    }

    function getNumTokens()
      public view returns (uint) {
        return _index.length;
    }

    function getCurrentTokens()
      public view _view_
        returns (address[] memory tokens)
    {
        revert('unimplemented');
        return (new address[](0));
    }

    function getFinalTokens()
      public view _view_
        returns (address[] memory tokens)
    {
        require(_finalized, ERR_NOT_FINALIZED);
        revert('unimplemented');
        return (new address[](0));
    }

    function getFee()
      public view
        returns (uint)
    {
        return _swapFee;
    }

    function getDenormalizedWeight(address token)
      public view
        returns (uint)
    {
        return _records[token].weight;
    }

    function getTotalDenormalizedWeight()
      public view 
      returns (uint)
    {
        uint res = 0;
        for( uint i = 0; i < _index.length; i++ ) {
            res = badd(res, _records[_index[i]].weight);
        }
        // TODO require(res != 0) ?
        return res;
    }

    function getNormalizedWeight(address token)
      public view
      returns (uint)
    {
        uint total = getTotalDenormalizedWeight();
        if (total == 0) {
            return 0;
        }
        // TODO require(res != 0) ?
        return bdiv(_records[token].weight, total);
    }

    function getBalance(address token)
      public view
      _view_
      returns (uint) {
        return _records[token].balance;
    }

    function finalize(uint initSupply)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require( !_finalized, ERR_IS_FINALIZED);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);

        _finalized = true;
        _paused = false;

        _mint(initSupply);
        _push(msg.sender, initSupply);
    }

    function joinPool(uint poolAo)
      public
        _beep_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);
        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = _records[t].balance;
            uint tAi = bmul(ratio, bal);
            _records[t].balance = badd(_records[t].balance, tAi);
            _pullT(t, msg.sender, tAi);
        }
        _mint(poolAo);
        _push(msg.sender, poolAo);
    }

    function exitPool(uint poolAi)
      public
        _beep_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);

        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAi, poolTotal);
       
        _pull(msg.sender, poolAi); 
        _burn(poolAi);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = _records[t].balance;
            uint tAo = bmul(ratio, bal);
            _records[t].balance = bsub(_records[t].balance, tAo);
            _pushT(t, msg.sender, tAo);
        }
    }

    function setParams(address token, uint balance, uint weight)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! _finalized, ERR_IS_FINALIZED);

        require(weight >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);

        uint oldWeight = _records[token].weight;
        if (weight > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(weight, oldWeight));
        } else {
            _totalWeight = bsub(_totalWeight, bsub(oldWeight, weight));
        }        
        _records[token].weight = weight;

        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;

        if (balance > oldBalance) {
            _pullT(token, msg.sender, bsub(balance, oldBalance));
        } else if( balance < oldBalance) {
            _pushT(token, msg.sender, bsub(oldBalance, balance));
        }
    }

    function setFee(uint tradeFee)
      _beep_
      public
    { 
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(tradeFee <= MAX_FEE, ERR_MAX_FEE);
        _swapFee = tradeFee;
    }

    function setManager(address manager)
      _beep_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _manager = manager;
    }

    function bind(address token, uint balance, uint weight)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require( ! isBound(token), ERR_IS_BOUND);
        require( ! isFinalized(), ERR_IS_FINALIZED);

        require(_index.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);
        require(weight >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_WEIGHT, ERR_MAX_WEIGHT);

        _pullT(token, msg.sender, balance);

        _totalWeight = badd(_totalWeight, weight);

        _index.push(token);
        _records[token] = Record({
            index: _index.length - 1
          , weight: weight
          , balance: balance
        });
    }

    // Absorb any tokens that have been sent to this contract into the pool
    function gulp(address token)
      _beep_
      _lock_
      public
    {
        require(isBound(token), ERR_NOT_BOUND);
        _records[token].balance = ERC20(token).balanceOf(address(this));
    }

    function collect()
      _beep_
      _lock_
      public returns (uint collected)
    {
        require(msg.sender == _factory, ERR_NOT_FACTORY);
        uint fees = _balance[_factory];
        _push(_factory, fees);
        return (collected = fees);
    }

    function pause()
      _beep_
      public
    { 
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = true;
    }

    function start()
      _beep_
      public
    {
        // require( ! _finalized, ERR_IS_FINALIZED);   finalize must set _paused = false
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = false;
    }

    function getSpotPrice(address Ti, address To)
      public view
        _view_
        returns (uint P)
    {
        uint Bi = _records[Ti].balance;
        uint Wi = _records[Ti].weight;
        uint Bo = _records[To].balance;
        uint Wo = _records[To].weight;
        uint  f = _swapFee;
        return (P = _calc_SpotPrice(Bi, Wi, Bo, Wo, f));
    }

    function getSpotRate(address Ti, address To)
      public view
        returns (uint R)
    {
        uint Bi = _records[Ti].balance;
        uint Wi = _records[Ti].weight;
        uint Bo = _records[To].balance;
        uint Wo = _records[To].weight;
        uint  f = _swapFee;
        return (R = _calc_SpotRate(Bi, Wi, Bo, Wo, f));
    }

    function getSpotPriceSansFee(address Ti, address To)
      public view
        _view_
        returns (uint P)
    {
        uint Bi = _records[Ti].balance;
        uint Wi = _records[Ti].weight;
        uint Bo = _records[To].balance;
        uint Wo = _records[To].weight;
        return (P = _calc_SpotPrice(Bi, Wi, Bo, Wo, 0));
    }

    function getSpotRateSansFee(address Ti, address To)
      public view
        _view_
        returns (uint P)
    {
        uint Bi = _records[Ti].balance;
        uint Wi = _records[Ti].weight;
        uint Bo = _records[To].balance;
        uint Wo = _records[To].weight;
        return (P = _calc_SpotRate(Bi, Wi, Bo, Wo, 0));
    }


    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint LP)
        _beep_
        _lock_
        public returns (uint Ao, uint MP)
    {
        
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( ! isPaused(), ERR_IS_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require( Ai <= bmul(I.balance, MAX_TRADE_IN), ERR_MAX_IN );

        require( LP >= _calc_SpotPrice(I.balance, I.weight, O.balance, O.weight, _swapFee )
               , ERR_LIMIT_PRICE);

        Ao = _calc_OutGivenIn(I.balance, I.weight, O.balance, O.weight, Ai, _swapFee);
        require( Ao >= Lo, ERR_LIMIT_FAILED );

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = _calc_SpotPrice(Iafter, I.weight, Oafter, O.weight, _swapFee);
        require(Pafter <= LP, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ao, Pafter);
    }

    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        _beep_
        _lock_ 
        public returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! isPaused(), ERR_IS_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE );
        require(PL < _calc_SpotRate(I.balance, I.weight, O.balance, O.weight, _swapFee), ERR_OUT_OF_RANGE );

        Ai = _calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, _swapFee);
        require( Ai <= Li, ERR_LIMIT_FAILED);

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = badd(O.balance, Ao);
        uint Pafter = _calc_SpotRate(Iafter, I.weight, Oafter, O.weight, _swapFee);
        require( Pafter >= PL, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Pafter);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        _beep_
        _lock_
        public returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! isPaused(), ERR_IS_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE);
        require(MP < _calc_SpotRate(I.balance, I.weight, O.balance, O.weight, _swapFee), ERR_OUT_OF_RANGE);

        Ai = _calc_InGivenPrice( I.balance, I.weight, O.balance, O.weight, MP, _swapFee );
        Ao = _calc_OutGivenIn( I.balance, I.weight, O.balance, O.weight, Ai, _swapFee );

        require( Ai <= Li, ERR_LIMIT_FAILED);
        require( Ao >= Lo, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao);
    }

    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        _beep_
        _lock_
        public returns (uint Ai, uint Ao, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! isPaused(), ERR_IS_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        uint Pbefore = _calc_SpotRate( I.balance, I.weight, O.balance, O.weight, _swapFee);
        require( PL <= Pbefore, ERR_OUT_OF_RANGE);

        Ai = _calc_InGivenPrice(I.balance, I.weight, O.balance, O.weight, PL, _swapFee);
        if( Ai > Li ) {
            Ai = Li;
        }

        Ao = _calc_OutGivenIn(I.balance, I.weight, Ai, O.balance, O.weight, _swapFee);
        if( Ao < Lo ) {
            Ao = Lo;
            Ai = _calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, _swapFee);
        }

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = _calc_SpotRate(Iafter, I.weight, Oafter, O.weight, _swapFee);
    
        require( Pafter >= PL, ERR_LIMIT_PRICE );

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao, Pafter);
    }

    function joinswap_ExternAmountIn(address Ti, uint256 tAi)
      public
        _beep_
        _lock_
        returns (uint poolAo)
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        uint oldPoolTotal = _totalSupply;

        Record storage T = _records[Ti];

        // Charge the trading fee for the proportion of tokenAi
        ///  which is implicitly traded to the other pool tokens.
        // That proportion is (1-T.normalizedWeight)
        // tokenAiAfterFee = tAi - tAi * (1-T.normalizedWeight) * poolFee;
        uint normalized = getNormalizedWeight(Ti);
        uint boo = bsub(BONE, normalized);
        uint bar = bmul(tAi, bmul(boo, _swapFee));
        uint baz = bsub(tAi, bar);
        uint tokenAiAfterFee = baz;

        uint newBalTi = badd(T.balance, tokenAiAfterFee);
        uint ratioTi = bdiv(newBalTi, T.balance);

        // uint newPoolTotal = (ratioTi ^ T.weight) * oldPoolTotal;
        uint zoo = bpow(ratioTi, normalized);
        uint zar = bmul(zoo, oldPoolTotal);
        poolAo = bsub(zar, oldPoolTotal);

        _mint(poolAo);
        _push(msg.sender, poolAo);
        _pullT(Ti, msg.sender, tAi);
        T.balance = badd(T.balance, tAi);
        return poolAo;
    }

    // ==
    // Internal token-manipulation functions are NOT locked
    // You must `_lock_` or otherwise ensure reentry-safety
    // Note that `_swap` changes record balances, but `_push` and `_pull` do not

    function _swap(address Ti, uint Ai, address To, uint Ao)
      internal
    {
        Record storage I = _records[Ti];
        Record storage O = _records[To];

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        _pullT(Ti, msg.sender, Ai);
        _pushT(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);
    }

    function _pullT(address erc20, address from, uint amt)
      internal
    {
        bool xfer = ERC20(erc20).transferFrom(from, address(this), amt);
        require(xfer, ERR_ERC20_FALSE);
    }

    function _pushT(address erc20, address to, uint amt)
      internal
    {
        bool xfer = ERC20(erc20).transfer(to, amt);
        require(xfer, ERR_ERC20_FALSE);
    }

}
