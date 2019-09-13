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

    bool                      _mutex;

    bool                      _public;
    bool                      _paused;

    address                   _factory;
    address                   _manager;

    uint                      _swapFee;
    uint                      _exitFee;

    address[]                 _index; // private index for iteration
    mapping(address=>Record)  _records; // token balance/weight
    uint                      _totalWeight;

    constructor() public {
        _public = false;
        _manager = msg.sender;
        _paused = true;
    }

    function getManager()
      public view returns (address) {
        return _manager;
    }

    function isPaused()
      public view returns (bool) {
        return _paused;
    }

    function isBound(address token)
      public view returns (bool) {
        return _records[token].weight != 0;
    }

    function getNumTokens()
      public view returns (uint) {
        return _index.length;
    }

    function getFee()
      public view returns (uint) {
        return _swapFee;
    }

    function getWeight(address token)
      public view returns (uint) {
        return _records[token].weight;
    }

    function getTotalWeight()
      public view returns (uint)
    {
        uint res = 0;
        for( uint i = 0; i < _index.length; i++ ) {
            res = badd(res, _records[_index[i]].weight);
        }
        // TODO require(res != 0) ?
        return res;
    }

    function getNormalizedWeight(address token)
      public view returns (uint)
    {
        uint total = getTotalWeight();
        if (total == 0) {
            return 0;
        }
        // TODO require(res != 0) ?
        return bdiv(_records[token].weight, total);
    }

    function getBalance(address token)
      public view returns (uint) {
        return _records[token].balance;
    }

    function isPublic()
      public view returns (bool) {
        return _public;
    }

    function makePublic(uint initSupply)
      _beep_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);
        _public = true;
        _mint(initSupply);
        _push(msg.sender, initSupply);
    }

    function joinPool(uint poolAo)
      _beep_
      _lock_
      public
    {
        require(_public, ERR_NOT_PUBLIC);
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
      _beep_
      _lock_
      public
    {
        require(_public, ERR_NOT_PUBLIC);

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

    // Note the argument is the *pool token* amount *out*
    function joinswap_PoolAmountOut(uint pAo, address Ti)
        _beep_
        _lock_
        public
    {
        revert('unimplemented');
    }
    // Note the argument is the *pool token* amount *in*
    function exitswap_PoolAmountIn(uint pAi, address To)
        _beep_
        _lock_
        public
    {
        require( isBound(To), ERR_NOT_BOUND );

        Record memory T = _records[To];

        uint oldPoolTotal = totalSupply();

        // pAi_fee = poolAi - poolAi * (1-weightTo) * poolFee
        uint boo = bsub(1, T.weight);
        uint bar = bmul(pAi, boo);
        uint baz = bmul(bar, _exitFee);
        uint pAi_fee = bsub(pAi, baz);

        uint newPoolTotal = bsub(oldPoolTotal, pAi_fee);
        uint poolRatio = bdiv(newPoolTotal, oldPoolTotal);
     
        // newBalTo = poolRatio^(1/weightTo) * oldBalTo;
        uint zoo = bdiv(1, T.weight); 
        uint zar = bpow(poolRatio, zoo);
        uint newBalTo = bmul(zar, T.balance);

        T.balance = newBalTo;
        _totalSupply = newPoolTotal;

        uint tAo = bsub(T.balance, newBalTo);

        revert('todo set balance/supply');
        _pull(msg.sender, pAi); // Pull pAi, not only poolAiAfterFee
        _burn(pAi);
        _pushT(To, msg.sender, tAo);
    }

    function joinswap_ExternAmountIn(address Ti, uint tAi)
        _beep_
        _lock_
        public
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        uint oldPoolTotal = totalSupply();

        Record memory T = _records[Ti];


        // poolAo = PoolOutGivenIn(totalSupply(), Ti, T.weight, tAi, _swapFee);
        // return poolAo * (1-(_exitFee/2);

        // Charge the trading fee for the proportion of tokenAi
        ///  which is implicitly traded to the other pool tokens.
        // That proportion is (1-T.weight)
        // tokenAiAfterFee = tAi - tAi * (1-T.weight) * poolFee;
        uint boo = bsub(1, T.weight);
        uint bar = bmul(tAi, bmul(boo, _swapFee));
        uint baz = bsub(tAi, bar);
        uint tokenAiAfterFee = baz;

        uint newBalTi = T.balance + tAi;
        uint ratioTi = bdiv(newBalTi, T.balance);

        // uint newPoolTotal = (ratioTi ^ T.weight) * oldPoolTotal;
        uint zoo = bpow(ratioTi, T.weight);
        uint zar = bmul(zoo, oldPoolTotal);
        uint poolAo = bsub(zar, oldPoolTotal);

        revert('todo set balance/supply');
        _mint(poolAo);
        _push(msg.sender, poolAo);
        _pullT(Ti, msg.sender, tAi);
    }

    function exitswap_ExternAmountOut(address To, uint tAo)
        _beep_
        _lock_
        public returns (uint pAo)
    {
        require( isBound(To), ERR_NOT_BOUND );
        uint oldPoolTotal = totalSupply();
        Record memory T = _records[To];
        uint newBalTo = T.balance - tAo;
        uint ratioTo = bdiv(newBalTo, T.balance);
        //uint newPoolTotal = (ratioTo ^ weightTo) * oldPoolTotal;
        uint boo = bpow(ratioTo, T.weight);
        uint bar = bmul(boo, oldPoolTotal);
        uint newPoolTotal = bar;
        uint poolAo = oldPoolTotal - newPoolTotal;

        //uint poolAoBeforeTradingFee = poolAo / (1 - (1-weightTo) * poolTradingFee) ;
        uint zoo = (1 - T.weight);
        uint zar = bmul(zoo, _swapFee); // poolAoBeforeTradingFees
        uint poolAoBeforeFees = zar / (1-_exitFee);
       
        revert('todo set balance/supply'); 
        _pull(msg.sender, poolAoBeforeFees );  // Pull poolAoBeforeFees , not only poolAo 
        _burn(poolAoBeforeFees);    
        _pushT(To, msg.sender, tAo);
        return poolAoBeforeFees;
    }

    function setParams(address token, uint balance, uint weight)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! _public, ERR_NOT_PUBLIC);

        require(weight >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);

        uint oldWeight = _records[token].weight;
        if (weight > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(weight, oldWeight));
            require(_totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT);
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
        require(_index.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);
        require(weight >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_WEIGHT, ERR_MAX_WEIGHT);

        _pullT(token, msg.sender, balance);

        _totalWeight = badd(_totalWeight, weight);

        require(_totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT);

        _index.push(token);
        _records[token] = Record({
            index: _index.length - 1
          , weight: weight
          , balance: balance
        });
    }

    function unbind(address token)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(isBound(token), ERR_NOT_BOUND);

        Record memory T = _records[token];
     
        _pullT(token, msg.sender, T.balance); 

        _totalWeight = bsub(_totalWeight, T.weight);

        delete _records[token]; // zero all values

        uint index = _records[token].index;
        uint last = _index.length-1;
        if( index != last ) {
            _index[index] = _index[last];
        }
        _index.pop();
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
      public
    {
        require(msg.sender == _factory, ERR_NOT_FACTORY);
        uint fees = _balance[_factory];
        uint poolTotal = totalSupply();
        uint ratio = bdiv(fees, poolTotal);
 
        _pull(_factory, fees);
        _burn(fees);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal  = _records[t].balance;
            uint tAo  = bmul(ratio, bal);
            _pushT(t, _factory, tAo);
        }
    }

    function pause()
      _beep_
      public
    { 
        require( ! _public, ERR_NOT_PUBLIC);
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = true;
    }

    function start()
      _beep_
      public
    {
        require( ! _public, ERR_NOT_PUBLIC);
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = false;
    }

    function getSpotPrice(address Ti, address To)
      public view
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

        require( LP <= _calc_SpotRate(I.balance, I.weight, O.balance, O.weight, _swapFee ), ERR_LIMIT_PRICE);

        Ao = _calc_OutGivenIn(I.balance, I.weight, O.balance, O.weight, Ai, _swapFee);
        require( Ao >= Lo, ERR_LIMIT_FAILED );

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = _calc_SpotRate(Iafter, I.weight, Oafter, O.weight, _swapFee);
        require(Pafter > LP, ERR_LIMIT_FAILED);

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

    // ==
    // Internal token-manipulation functions are NOT locked
    // You must `_lock_` or otherwise ensure reentry-safety
    // Note that `_swap` changes record balances, but `_push` and `_pull` do not

    function _swap(address Ti, uint Ai, address To, uint Ao)
      internal
    {
        Record memory I = _records[Ti];
        Record memory O = _records[To];

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
