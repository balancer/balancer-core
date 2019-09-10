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

import "erc20/erc20.sol";

import "./BToken.sol";
import "./BMath.sol";

contract BPool is ERC20
                , BMath
                , BTokenBase
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

    event LOG_CALL( address indexed caller
                  , bytes4  indexed sig
                  , bytes           data
                  ) anonymous;

    modifier _note_() {
        emit LOG_CALL(msg.sender, msg.sig, msg.data);
        _;
    }

    modifier _mute_() {
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
    mapping(address=>Record)  _records;
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

    function isJoinable()
      public view returns (bool) {
        return _public;
    }

    function makeJoinable(uint initSupply)
      _note_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);
        _public = true;
        _mint(initSupply);
        _push(msg.sender, initSupply);
    }

    function joinPool(uint poolAo)
      _note_
      _mute_
      public
    {
        require(_public, ERR_NOT_JOINABLE);
        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = _records[t].balance;
            uint tAi = bmul(ratio, bal);
            _pullT(t, msg.sender, tAi);
        }
        _mint(poolAo);
        _push(msg.sender, poolAo);
    }

    function exitPool(uint poolAi)
      _note_
      _mute_
      public
    {
        require(_public, ERR_NOT_JOINABLE);

        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAi, poolTotal);
       
        _pull(msg.sender, poolAi); 
        _burn(poolAi);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = _records[t].balance;
            uint tAo = bmul(ratio, bal);
            _pushT(t, msg.sender, tAo);
        }
    }

    function setParams(address token, uint balance, uint weight)
      _note_
      _mute_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! _public, ERR_NOT_JOINABLE);

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
      _note_
      public
    { 
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require(tradeFee <= MAX_FEE, ERR_MAX_FEE);
        _swapFee = tradeFee;
    }

    function setManager(address manager)
      _note_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _manager = manager;
    }

    function bind(address token, uint balance, uint weight)
      _note_
      _mute_
      public
    {
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        require( ! isBound(token), ERR_ALREADY_BOUND);
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
      _note_
      _mute_
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
      _note_
      _mute_
      public
    {
        require(isBound(token), ERR_NOT_BOUND);
        _records[token].balance = ERC20(token).balanceOf(address(this));
    }

    function collect()
      _note_
      _mute_
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
      _note_
      public
    { 
        require( ! _public, ERR_NOT_JOINABLE);
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = true;
    }

    function start()
      _note_
      public
    {
        require( ! _public, ERR_NOT_JOINABLE);
        require(msg.sender == _manager, ERR_NOT_MANAGER);
        _paused = false;
    }

    // TODO fee
    function getSpotPrice(address Ti, address To)
      public view returns (uint P)
    {
        Record memory I = _records[Ti];
        Record memory O = _records[To];
        return _calc_SpotPrice(I.balance, I.weight, O.balance, O.weight);
    }

    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint LP)
        _note_
        _mute_
        public returns (uint Ao, uint MP)
    {
        
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( ! isPaused(), ERR_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require( Ai <= bmul(I.balance, MAX_TRADE_IN), ERR_MAX_IN );

        require( LP <= _calc_SpotPrice(I.balance, I.weight, O.balance, O.weight ), ERR_LIMIT_PRICE);

        Ao = _calc_OutGivenIn(I.balance, I.weight, O.balance, O.weight, Ai, _swapFee);
        require( Ao >= Lo, ERR_LIMIT_FAILED );

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = _calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require(Pafter > LP, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ao, Pafter);
    }

    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        _note_
        _mute_ 
        public returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE );
        require(PL < _calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE );

        Ai = _calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, _swapFee);
        require( Ai <= Li, ERR_LIMIT_FAILED);

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = badd(O.balance, Ao);
        uint Pafter = _calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require( Pafter >= PL, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Pafter);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        _note_
        _mute_
        public returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE);
        require(MP < _calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE);

        Ai = _calc_InGivenPrice( I.balance, I.weight, O.balance, O.weight, MP, _swapFee );
        Ao = _calc_OutGivenIn( I.balance, I.weight, O.balance, O.weight, Ai, _swapFee );

        require( Ai <= Li, ERR_LIMIT_FAILED);
        require( Ao >= Lo, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao);
    }

    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        _note_
        _mute_
        public returns (uint Ai, uint Ao, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        uint Pbefore = _calc_SpotPrice( I.balance, I.weight, O.balance, O.weight);
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
        uint Pafter = _calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
    
        require( Pafter >= PL, ERR_LIMIT_PRICE );

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao, Pafter);
    }

    // Internal token-manipulation functions are NOT locked
    // You must `_mute_` or otherwise ensure reentry-safety
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
