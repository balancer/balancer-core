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

import "./BBronze.sol";
import "./BToken.sol";
import "./BMath.sol";
import "./BBase.sol";

contract BPool is ERC20
                , BPoolBronze
                , BTokenBase
                , BMath
                , BBase
{

    bool                      paused;
    address                   manager;

    uint                      fee;

    mapping(address=>Record)  records;
    address[]                 _index; // private index for iteration
    uint                      totalWeight;

    bool                      joinable;

    bool                      mutex;

    struct Record {
        bool    bound;
        uint    index;   // int
        uint    weight;  // bnum
        uint    balance; // bnum
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
        joinable = false;
    }

    function getManager()
      public view returns (address) {
        return manager;
    }

    function isPaused()
      public view returns (bool) {
        return paused;
    }

    function isBound(address token)
      public view returns (bool) {
        return records[token].bound;
    }

    function getNumTokens()
      public view returns (uint) {
        return _index.length;
    }

    function getFee()
      public view returns (uint) {
        return fee;
    }

    function getWeight(address token)
      public view returns (uint) {
        return records[token].weight;
    }

    function getTotalWeight()
      public view returns (uint)
    {
        uint res = 0;
        for( uint i = 0; i < _index.length; i++ ) {
            res = badd(res, records[_index[i]].weight);
        }
        return res;
    }

    function getNormalizedWeight(address token)
      public view returns (uint)
    {
        uint total = getTotalWeight();
        if (total == 0) {
            return 0;
        }
        return bdiv(records[token].weight, total);
    }

    function getBalance(address token)
      public view returns (uint) {
        return records[token].balance;
    }

    function isJoinable()
      public view returns (bool) {
        return joinable;
    }

    function makeJoinable(uint initSupply)
      public // emits LOG_CALL
    {
        logcall();
        require(msg.sender == manager, ERR_BAD_CALLER);
        require(initSupply >= MIN_TOKEN_SUPPLY);
        joinable = true;
        _mint(initSupply);
        _push(msg.sender, initSupply);
    }

    function joinPool(uint poolAo)
      public // TODO LOG_SWAP
    {
        require(joinable, ERR_UNJOINABLE);
        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = records[t].balance;
            uint tAi = bmul(ratio, bal);
            bool ok = ERC20(t).transferFrom(msg.sender, address(this), tAi);
            require(ok, ERR_ERC20_FALSE);
        }
        _mint(poolAo);
        _push(msg.sender, poolAo);
    }

    function exitPool(uint poolAi)
      public // emits LOG_SWAP
    {
        require(joinable, ERR_UNJOINABLE);
        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAi, poolTotal);
       
        _pull(msg.sender, poolAi); 
        _burn(poolAi);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = records[t].balance;
            uint tAo = bmul(ratio, bal);
            bool ok = ERC20(t).transfer(msg.sender, tAo);
            require(ok, ERR_ERC20_FALSE);
        }
    }

    function setParams(address token, uint balance, uint weight)
      public // emits LOG_PARAMS
    {
        require(msg.sender == manager, ERR_BAD_CALLER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! joinable, ERR_UNJOINABLE);

        require(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);

        uint oldWeight = records[token].weight;
        records[token].weight = weight;

        if (weight > oldWeight) {
            totalWeight = badd(totalWeight, bsub(weight, oldWeight));
        } else {
            totalWeight = bsub(totalWeight, bsub(oldWeight, weight));
        }        

        uint oldBalance = records[token].balance;
        records[token].balance = balance;

        if (balance > oldBalance) {
            bool ok = ERC20(token).transferFrom(msg.sender, address(this), bsub(balance, oldBalance));
            require(ok, ERR_ERC20_FALSE);
        } else if( balance < oldBalance) {
            bool ok = ERC20(token).transfer(msg.sender, bsub(oldBalance, balance));
            require(ok, ERR_ERC20_FALSE);
        }

        emit LOG_PARAMS(token, balance, weight, totalWeight);
    }

    function batchSetParams(bytes32[3][] memory tokenBalanceWeights)
      public // emits LOG_PARAMS
    {
        for( uint i = 0; i < tokenBalanceWeights.length; i++ ) {
            bytes32[3] memory TBW = tokenBalanceWeights[i];
            setParams(address(bytes20(TBW[0])), uint(TBW[1]), uint(TBW[2]));
        }
    }

    function setFee(uint fee_)
      public
    { 
        logcall();
        require(msg.sender == manager, ERR_BAD_CALLER);
        require(fee_ <= MAX_FEE, ERR_MAX_FEE);
        fee = fee_;
    }

    function setManager(address manager_)
      public
    {
        logcall();
        require(msg.sender == manager, ERR_BAD_CALLER);
        manager = manager_;
    }


    function bind(address token, uint balance, uint weight)
      public // emits LOG_PARAMS
    {
        require(msg.sender == manager, ERR_BAD_CALLER);
        require( ! isBound(token), ERR_NOT_BOUND);
        require(_index.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);
        require(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);
        require(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        require(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);

        records[token] = Record({
            bound: true
          , index: _index.length
          , weight: 0
          , balance: 0
        });
        _index.push(token);

        setParams(token, balance, weight);
    }

    function unbind(address token)
      public // emits LOG_PARAMS
    {
        require(msg.sender == manager, ERR_BAD_CALLER);
        require(isBound(token), ERR_NOT_BOUND);

        Record memory T = records[token];
      
        bool xfer = ERC20(token).transfer(msg.sender, T.balance);
        require(xfer, ERR_ERC20_FALSE);

        totalWeight = bsub(totalWeight, T.weight);

        emit LOG_PARAMS(token, T.balance, T.weight, totalWeight);

        uint index = records[token].index;
        uint last = _index.length-1;
        if( index != last ) {
            _index[index] = _index[last];
        }
        _index.pop();
        delete records[token];
    }

    // Collect any excess token that may have been transferred in
    function sweep(address token)
      public
    { 
        require(msg.sender == manager, ERR_BAD_CALLER);
        require(isBound(token), ERR_NOT_BOUND);
        uint selfBalance = records[token].balance;
        uint trueBalance = ERC20(token).balanceOf(address(this));
        bool ok = ERC20(token).transfer(msg.sender, bsub(trueBalance, selfBalance));
        require(ok, ERR_ERC20_FALSE);
    }

    function pause()
      public
    { 
        logcall();
        require(msg.sender == manager, ERR_BAD_CALLER);
        paused = true;
    }

    function start()
      public
    {
        logcall();
        require(msg.sender == manager, ERR_BAD_CALLER);
        paused = false;
    }

    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint LP)
        public returns (uint Ao, uint MP)
    {
        
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( ! isPaused(), ERR_PAUSED );

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        require( Ai <= bmul(I.balance, MAX_TRADE_IN), ERR_MAX_IN );

        require( LP <= calc_SpotPrice(I.balance, I.weight, O.balance, O.weight ), ERR_LIMIT_PRICE);

        Ao = calc_OutGivenIn(I.balance, I.weight, O.balance, O.weight, Ai, fee);
        require( Ao >= Lo, ERR_LIMIT_FAILED );

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = bsub(O.balance, Ao);
        uint Pafter = calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require(Pafter > LP, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ao, Pafter);
    }


    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        public returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! paused, ERR_PAUSED);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE );
        require(PL < calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE );

        Ai = calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, fee);
        require( Ai <= Li, ERR_LIMIT_FAILED);

        uint Iafter = badd(I.balance, Ai);
        uint Oafter = badd(O.balance, Ao);
        uint Pafter = calc_SpotPrice(Iafter, I.weight, Oafter, O.weight);
        require( Pafter >= PL, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Pafter);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        public returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! paused, ERR_PAUSED);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        // TODO error names
        require(Ao <= bmul(O.balance, MAX_TRADE_OUT), ERR_OUT_OF_RANGE);
        require(MP < calc_SpotPrice(I.balance, I.weight, O.balance, O.weight), ERR_OUT_OF_RANGE);

        Ai = calc_InGivenPrice( I.balance, I.weight, O.balance, O.weight, MP, fee );
        Ao = calc_OutGivenIn( I.balance, I.weight, O.balance, O.weight, Ai, fee );

        require( Ai <= Li, ERR_LIMIT_FAILED);
        require( Ao >= Lo, ERR_LIMIT_FAILED);

        _swap(Ti, Ai, To, Ao);

        return (Ai, Ao);
    }

    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        public returns (uint Ai, uint Ao, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( ! paused, ERR_PAUSED );

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        // TODO error names
        uint Pbefore = calc_SpotPrice( I.balance, I.weight, O.balance, O.weight);
        require( PL <= Pbefore, ERR_OUT_OF_RANGE);

        Ai = calc_InGivenPrice(I.balance, I.weight, O.balance, O.weight, PL, fee);
        if( Ai > Li ) {
            Ai = Li;
        }

        Ao = calc_OutGivenIn(I.balance, I.weight, Ai, O.balance, O.weight, fee);
        if( Ao < Lo ) {
            Ao = Lo;
            Ai = calc_InGivenOut(I.balance, I.weight, O.balance, O.weight, Ao, fee);
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
        _swap(false, Ti, Ai, To, Ao);
    }

    function _swap(bool wrap, address Ti, uint Ai, address To, uint Ao)
        internal
    {
        require( ! mutex, ERR_ERC20_REENTRY);
        mutex = true;

        bool xfer;
        Record memory I = records[Ti];
        Record memory O = records[To];

        if (wrap) {
            (uint deficit, bool negative) = bsubSign(Ai, I.balance);
            revert('unimplemented');
        } else {
            // forceWrap
            // 
            // forceUnwrap
            xfer = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            require(xfer, ERR_ERC20_FALSE);
        }

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, fee);

        if ( ! wrap) {
            xfer = ERC20(To).transfer(msg.sender, Ao);
            require(xfer, ERR_ERC20_FALSE);
        }

        mutex = false;
    }

}
