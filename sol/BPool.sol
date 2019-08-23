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

import 'erc20/erc20.sol';

import 'ds-token/token.sol';
import 'ds-note/note.sol';

import "./BBronze.sol";
import "./BMath.sol";
import "./BError.sol";

contract BPool is BPoolBronze
                , BError
                , BMath
                , DSNote
{
    bool                      paused;
    address                   manager;

    uint                      tradeFee;
    uint                      exitFee;

    mapping(address=>Record)  records;
    address[]                 _index; // private index for iteration
    uint                      totalWeight;

    bool                      joinable;
    address                   poolcoin;

    struct Record {
        bool    bound;
        uint    index;   // int
        uint    weight;  // bnum
        uint    balance; // bnum
    }

    constructor(bool enableToken) public {
        manager = msg.sender;
        paused = true;
        poolcoin = address(new DSToken("Balancer Pool Token (Bronze)"));
        joinable = enableToken;
    }

    function getPoolToken()
      public view
        returns (address) {
        return poolcoin;
    }

    function getPoolTokenSupply()
      public view
        returns (uint) {
        return ERC20(poolcoin).totalSupply();
    }

    function getManager()
      public view
        returns (address) {
        return manager;
    }

    function isPaused()
      public view
        returns (bool) {
        return paused;
    }

    function isBound(address token)
      public view
        returns (bool) {
        return records[token].bound;
    }

    function getNumTokens()
      public view
        returns (uint) {
        return _index.length;
    }

    function getFee()
      public view
        returns (uint) {
        return tradeFee;
    }

    function getWeight(address token)
      public view
        returns (uint) {
        return records[token].weight;
    }

    function getTotalWeight() public view returns (uint) {
        uint res = 0;
        for( uint i = 0; i < _index.length; i++ ) {
            res = badd(res, records[_index[i]].weight);
        }
        return res;
    }

    function getNormalizedWeight(address token) public view returns (uint) {
        uint total = getTotalWeight();
        if (total == 0) {
            return 0;
        }
        return bdiv(records[token].weight, total);
    }

    function getBalance(address token)
      public view
        returns (uint) {
        return records[token].balance;
    }

    function getWeightedBalance(address token) public view returns (uint)
    {
        token=token; revert('unimplemented');
    }

    function getWeightedTotalBalance() public view returns (uint res)
    {
        if (_index.length == 0) return 0;
        res = BONE;
        for (uint i = 0; i < _index.length; i++) {
            res *= bpow(records[_index[i]].balance, records[_index[i]].weight);
        }
        return res;
    }
 
    function isJoinable() public view returns (bool) {
        return joinable;
    }

    function makeJoinable()
        public
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        joinable = true;
    }

    function joinPool(uint poolAo)
        public
    {
        //require(joinable, "not joinable");
        uint poolTotal = ERC20(poolcoin).totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
/*
        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = records[t].balance;
            uint tAi = bmul(ratio, bal);
            bool ok = ERC20(t).transferFrom(msg.sender, address(this), tAi);
            check(ok, ERR_ERC20_FALSE);
        }
        bool ok = ERC20(poolcoin).transfer(msg.sender, poolAo);
        check(ok, ERR_ERC20_FALSE);
*/
    }

    function exitPool(uint poolAi)
        public
    {
        //require(joinable, "not joinable");
        uint poolTotal = ERC20(poolcoin).totalSupply();
        uint ratio = bdiv(poolAi, poolTotal);

/*
        bool ok = ERC20(poolcoin).transferFrom(msg.sender, address(this), poolAi);
        check(ok, ERR_ERC20_FALSE);

        for( uint i = 0; i < _index.length; i++ ) {
            address t = _index[i];
            uint bal = records[t].balance;
            uint tAo = bmul(ratio, bal);
            bool ok = ERC20(t).transfer(msg.sender, tAo);
            check(ok, ERR_ERC20_FALSE);
        }
*/
    }

    function setParams(address token, uint weight, uint balance)
      public {
    //  note by sub-calls
        setWeightDirect(token, weight);
        setBalanceDirect(token, balance);
    }

    function setWeightDirect(address token, uint weight)
      public note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        check(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        check(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);
        check(weight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT);
        check( ! joinable, ERR_UNJOINABLE);

        uint oldWeight = records[token].weight;
        records[token].weight = weight;

        if (weight > oldWeight) {
            totalWeight = badd(totalWeight, weight - oldWeight);
            check(totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_WEIGHT);
        } else {
            totalWeight = bsub(totalWeight, oldWeight - weight);
        }        
    }

    function setBalanceDirect(address token, uint balance)
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        check(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        check(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);
        check( ! joinable, ERR_UNJOINABLE);

        uint oldBalance = records[token].balance;
        records[token].balance = balance;

        if (balance > oldBalance) {
            bool ok = ERC20(token).transferFrom(msg.sender, address(this), balance - oldBalance);
            check(ok, ERR_ERC20_FALSE);
        } else if( balance < oldBalance) {
            bool ok = ERC20(token).transfer(msg.sender, oldBalance - balance);
            check(ok, ERR_ERC20_FALSE);
        }

    }

    function setFee(uint tradeFee_)
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(tradeFee_ <= MAX_FEE, ERR_MAX_FEE);
        tradeFee = tradeFee_;
    }

    function setManager(address manager_)
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        manager = manager_;
    }


    function bind(address token, uint balance, uint weight)
      public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check( ! isBound(token), ERR_NOT_BOUND);
        check(_index.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);
        check(balance >= MIN_TOKEN_BALANCE, ERR_MIN_BALANCE);
        check(balance <= MAX_TOKEN_BALANCE, ERR_MAX_BALANCE);
        check(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);
        check(weight <= MAX_TOKEN_WEIGHT, ERR_MAX_WEIGHT);
        check(totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT);

        bool ok = ERC20(token).transferFrom(msg.sender, address(this), balance);
        check(ok, ERR_ERC20_FALSE);

        totalWeight += weight;
        records[token] = Record({
            bound: true
          , index: _index.length
          , weight: weight
          , balance: balance
        });
        _index.push(token);
    }

    function unbind(address token)
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);

        uint balance = ERC20(token).balanceOf(address(this));
        bool ok = ERC20(token).transfer(msg.sender, balance);
        check(ok, ERR_ERC20_FALSE);

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
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        uint selfBalance = records[token].balance;
        uint trueBalance = ERC20(token).balanceOf(address(this));
        bool ok = ERC20(token).transfer(msg.sender, trueBalance - selfBalance);
        check(ok, ERR_ERC20_FALSE);
    }

    function pause()
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        paused = true;
    }

    function start()
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        paused = false;
    }


    function viewSwap_ExactInAnyOut(address Ti, uint Ai, address To)
      public view 
        returns (uint Ao, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ao = calc_OutGivenIn( I.balance, I.weight
                            , O.balance, O.weight
                            , Ai, tradeFee );

        if( paused ) return (Ao, ERR_PAUSED);

        return (Ao, ERR_NONE);
    }

    function trySwap_ExactInAnyOut(address Ti, uint Ai, address To)
      public returns (uint Ao, byte err)
    {
        (Ao, err) = viewSwap_ExactInAnyOut(Ti, Ai, To);
        if (err != ERR_NONE) {
            return (Ao, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInAnyOut(address Ti, uint Ai, address To)
      public returns (uint Ao)
    {
        byte err;
        (Ao, err) = trySwap_ExactInAnyOut(Ti, Ai, To);
        check(err);
        return Ao;
    }

    function viewSwap_AnyInExactOut(address Ti, address To, uint Ao)
      public view
        returns (uint Ai, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ai = calc_InGivenOut( I.balance, I.weight
                            , O.balance, O.weight
                            , Ao, tradeFee );

        if( paused ) return (Ai, ERR_PAUSED);

        return (Ai, ERR_NONE);
    }

    function trySwap_AnyInExactOut(address Ti, address To, uint Ao)
      public returns (uint Ai, byte err)
    {
        (Ai, err) = viewSwap_AnyInExactOut(Ti, To, Ao);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ai, ERR_NONE);
        }
    }

    function doSwap_AnyInExactOut(address Ti, address To, uint Ao)
      public returns (uint Ai)
    {
        byte err;
        (Ai, err) = trySwap_AnyInExactOut(Ti, To, Ao);
        check(err);
        return Ai;
    }

    function viewSwap_ExactInMinOut(address Ti, uint Ai, address To, uint Lo)
        public view returns (uint Ao, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];


        Ao = calc_OutGivenIn( I.balance, I.weight
                            , O.balance, O.weight
                            , Ai, tradeFee );

        if( paused ) return (Ao, ERR_PAUSED);

        if( Ao < Lo ) return (Ao, ERR_LIMIT_FAILED);

        return (Ao, ERR_NONE);
 
    }

    function trySwap_ExactInMinOut(address Ti, uint Ai, address To, uint Lo)
        public returns (uint Ao, byte err)
    {
        (Ao, err) = viewSwap_ExactInMinOut(Ti, Ai, To, Lo);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInMinOut(address Ti, uint Ai, address To, uint Lo)
        public returns (uint Ao)
    {
        byte err;
        
        (Ai, err) = trySwap_ExactInMinOut(Ti, Ai, To, Lo);
        check(err);
        return Ai;
    }

    function viewSwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public view returns (uint Ao, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];



        uint maxAi = calc_InGivenPrice( I.balance, I.weight
                                      , O.balance, O.weight
                                      , SER1, tradeFee );

        if( paused ) return (Ao, ERR_PAUSED);

        if( Ai > maxAi ) return (Ao, ERR_LIMIT_FAILED);

        Ao = calc_OutGivenIn( I.balance, I.weight
                            , O.balance, O.weight
                            , Ai, tradeFee );

        return (Ao, ERR_NONE);
 
    }

    function trySwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public returns (uint Ao, byte err)
    {
        (Ao, err) = viewSwap_ExactInLimitPrice(Ti, Ai, To, SER1);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public returns (uint Ao)
    {
        byte err;
        
        (Ai, err) = trySwap_ExactInLimitPrice(Ti, Ai, To, SER1);
        check(err);
        return Ai;
    }


    function viewSwap_MaxInExactOut(address Ti, uint Li, address To, uint Ao)
      public view
        returns (uint Ai, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ai = calc_InGivenOut( I.balance, I.weight
                            , O.balance, O.weight
                            , Ao, tradeFee );

        if( paused ) return (Ai, ERR_PAUSED);

        if( Ai > Li ) return (Ai, ERR_LIMIT_FAILED);

        return (Ai, ERR_NONE);
    }

    function trySwap_MaxInExactOut(address Ti, uint Li, address To, uint Ao)
      public returns (uint Ai, byte err)
    {
        (Ai, err) = viewSwap_MaxInExactOut(Ti, Li, To, Ao);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ai, ERR_NONE);
        }
    }

    function doSwap_MaxInExactOut(address Ti, uint Li, address To, uint Ao)
      public returns (uint Ai)
    {
        byte err;
        (Ai, err) = trySwap_MaxInExactOut(Ti, Li, To, Ao);
        check(err);
        return Ai;
    }

    function viewSwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint SER1)
      public view
        returns (uint Ai, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        uint AiMax = calc_InGivenPrice( I.balance, I.weight
                                      , O.balance, O.weight
                                      , SER1, tradeFee );
                
        Ai    = calc_InGivenOut( I.balance, I.weight
                               , O.balance, O.weight
                               , Ao, tradeFee );

        if( paused ) return (Ai, ERR_PAUSED);

        if( Ai > AiMax ) return (Ai, ERR_LIMIT_FAILED);

        return (Ai, ERR_NONE);
    }

    function trySwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint Lp)
      public returns (uint Ai, byte err)
    {
        (Ai, err) = viewSwap_LimitPriceInExactOut(Ti, To, Ao, Lp);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ai, ERR_NONE);
        }
    }

    function doSwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint Lp)
      public returns (uint Ai)
    {
        byte err;
        (Ai, err) = trySwap_LimitPriceInExactOut(Ti, To, Ao, Lp);
        check(err);
        return Ai;
    }

    function viewSwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public view returns (uint Ai, uint Ao, byte err)
    {
        if( !isBound(Ti) ) return (0, 0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, 0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ai = calc_InGivenPrice( I.balance, I.weight
                              , O.balance, O.weight
                              , SER1, tradeFee );

        if( Ai > Li ) Ai = Li;

        Ao = calc_OutGivenIn( I.balance, I.weight
                            , O.balance, O.weight
                            , Ai, tradeFee );

        if( Ao < Lo ) return (Ai, Ao, ERR_LIMIT_FAILED);

        if( paused ) return (Ai, Ao, ERR_PAUSED);

        return (Ai, Ao, ERR_NONE);
    }

    function trySwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public returns (uint Ai, uint Ao, byte err)
    {
        (Ai, Ao, err) = viewSwap_MaxInMinOutLimitPrice(Ti, Li, To, Lo, SER1);
        if (err != ERR_NONE) {
            return (Ai, Ao, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, tradeFee);
            return (Ai, Ao, ERR_NONE);
        }
    }

    function doSwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public returns (uint Ai, uint Ao)
    {
        byte err;
        (Ai, Ao, err) = trySwap_MaxInMinOutLimitPrice(Ti, Li, To, Lo, SER1);
        check(err);
        return (Ai, Ao);
    }
}
