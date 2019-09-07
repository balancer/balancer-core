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

pragma solidity ^0.5.10;

import "erc20/erc20.sol";

import "./BColor.sol";
import "./BToken.sol";
import "./BMath.sol";
import "./BBase.sol";

contract BPool is ERC20
                , BBronze
                , BTokenBase
                , BMath
                , BBase
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

    modifier _beep_() {
        emit LOG_CALL(msg.sender, msg.sig, msg.data);
        _;
    }

    modifier _lock_() {
        require( !_mutex, ERR_REENTRY);
        _mutex = true;
        _;
        _mutex = false;
    }

    bool                      _mutex;

    bool                      _joinable;
    bool                      _paused;

    address                   _hub;
    address                   _manager;

    uint                      _tradeFee;
    uint                      _exitFee;

    address[]                 _index; // private index for iteration
    mapping(address=>Record)  _records;
    uint                      _totalWeight;

    constructor() public {
        _joinable = false;
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
        return _tradeFee;
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
        return bdiv(_records[token].weight, total);
    }

    function getBalance(address token)
      public view returns (uint) {
        return _records[token].balance;
    }

    function isJoinable()
      public view returns (bool) {
        return _joinable;
    }

    function makeJoinable(uint initSupply)
      _beep_
      public
    {
        require(msg.sender == _manager, ERR_BAD_CALLER);
        require(initSupply >= MIN_TOKEN_SUPPLY);
        _joinable = true;
        _mint(initSupply);
        _push(msg.sender, initSupply);
    }

    function joinPool(uint poolAo)
      _beep_
      _lock_
      public
    {
        require(_joinable, ERR_UNJOINABLE);
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
      _beep_
      _lock_
      public
    {
        require(_joinable, ERR_UNJOINABLE);

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
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_BAD_CALLER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! _joinable, ERR_UNJOINABLE);

        require(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);

        uint oldWeight = _records[token].weight;
        _records[token].weight = weight;

        if (weight > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(weight, oldWeight));
        } else {
            _totalWeight = bsub(_totalWeight, bsub(oldWeight, weight));
        }        

        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;

        if (balance > oldBalance) {
            _pullT(token, msg.sender, bsub(balance, oldBalance));
        } else if( balance < oldBalance) {
            _pushT(token, msg.sender, bsub(oldBalance, balance));
        }
    }

    function setFee(uint _tradeFee_)
      _beep_
      public
    { 
        require(msg.sender == _manager, ERR_BAD_CALLER);
        require(_tradeFee_ <= MAX_FEE, ERR_MAX_FEE);
        _tradeFee = _tradeFee_;
    }

    function setManager(address _manager_)
      _beep_
      public
    {
        require(msg.sender == _manager, ERR_BAD_CALLER);
        _manager = _manager_;
    }

    function bind(address token, uint balance, uint weight)
      _beep_
      _lock_
      public
    {
        require(msg.sender == _manager, ERR_BAD_CALLER);
        require( ! isBound(token), ERR_ALREADY_BOUND);
        require(_index.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);
        require(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);
        require(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);

        _pullT(token, msg.sender, balance);

        _totalWeight = badd(_totalWeight, weight);

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
        require(msg.sender == _manager, ERR_BAD_CALLER);
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
        uint fees = _balance[_hub];
        uint poolTotal = totalSupply();
        uint ratio = bdiv(fees, poolTotal);
 
        _pull(_hub, fees);
        _burn(fees);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal  = _records[t].balance;
            uint tAo  = bmul(ratio, bal);
            _pushT(t, _hub, tAo);
        }
    }

    function pause()
      _beep_
      public
    { 
        require( ! _joinable, ERR_UNJOINABLE);
        require(msg.sender == _manager, ERR_BAD_CALLER);
        _paused = true;
    }

    function start()
      _beep_
      public
    {
        require( ! _joinable, ERR_UNJOINABLE);
        require(msg.sender == _manager, ERR_BAD_CALLER);
        _paused = false;
    }

    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint LP)
      _lock_
      public returns (uint Ao, uint MP)
    {
        
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( ! isPaused(), ERR_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require( Ai <= bmul(I.balance, MAX_TRADE_IN), ERR_MAX_IN );

        require( LP <= calc_SpotPrice(I.balance, I.weight, O.balance, O.weight ), ERR_LIMIT_PRICE);

        Ao = calc_OutGivenIn(I.balance, I.weight, O.balance, O.weight, Ai, _tradeFee);
        require( Ao >= Lo, ERR_LIMIT_FAILED );

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require(Pafter > LP, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ao, Pafter);
    }

    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
      _lock_ 
      public returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE );
        require(PL < calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE );

        Ai = calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, _tradeFee);
        require( Ai <= Li, ERR_LIMIT_FAILED);

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = badd(O.balance, Ao);
        uint Pafter = calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require( Pafter >= PL, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Pafter);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
      _lock_
      public returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED);

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE);
        require(MP < calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE);

        Ai = calc_InGivenPrice( I.balance, I.weight, O.balance, O.weight, MP, _tradeFee );
        Ao = calc_OutGivenIn( I.balance, I.weight, O.balance, O.weight, Ai, _tradeFee );

        require( Ai <= Li, ERR_LIMIT_FAILED);
        require( Ao >= Lo, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao);
    }

    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        _lock_
        public returns (uint Ai, uint Ao, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! _paused, ERR_PAUSED );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        // TODO error names
        uint Pbefore = calc_SpotPrice( I.balance, I.weight, O.balance, O.weight);
        require( PL <= Pbefore, ERR_OUT_OF_RANGE);

        Ai = calc_InGivenPrice(I.balance, I.weight, O.balance, O.weight, PL, _tradeFee);
        if( Ai > Li ) {
            Ai = Li;
        }

        Ao = calc_OutGivenIn(I.balance, I.weight, Ai, O.balance, O.weight, _tradeFee);
        if( Ao < Lo ) {
            Ao = Lo;
            Ai = calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, _tradeFee);
        }

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
    
        require( Pafter >= PL, ERR_LIMIT_PRICE );

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao, Pafter);
    }

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
