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

import 'ds-note/note.sol';

import "./BBronze.sol";
import "./BConst.sol";
import "./BMath.sol";
import "./BError.sol";

contract BPool is BPoolBronze
                , BConst
                , BError
                , BMath
                , DSNote
{
    bool                      paused;
    address                   manager;
    uint                      fee;
    uint                      totalWeight;
    mapping(address=>Record)  records;
    address[]                 _index; // private index for iteration

    bool                      fixedWeights;
    address                   ptoken;

    struct Record {
        bool    bound;
        uint    index;   // int
        uint    weight;  // bnum
        uint    balance; // bnum
    }

    constructor(address poolToken) public {
        manager = msg.sender;
        paused = true;
        ptoken = poolToken;
        fixedWeights = false; // TODO
    }

    function getPoolToken()
      public view
        returns (address) {
        return ptoken;
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
        return fee;
    }

    function getWeight(address token)
      public view
        returns (uint) {
        return records[token].weight;
    }

    function getBalance(address token)
      public view
        returns (uint) {
        return records[token].balance;
    }

    function getValue()
      public view
        returns (uint res)
    {
        if (_index.length == 0) return 0;
        res = 1;
        for (uint i = 0; i < _index.length; i++) {
            res *= bpow(records[_index[i]].balance, records[_index[i]].weight);
        }
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
                            , Ai, fee );

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

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, fee);
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
                            , Ao, fee );

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

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, fee);
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

    function viewSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];


        Ao = calc_OutGivenIn( I.balance, I.weight
                            , O.balance, O.weight
                            , Ai, fee );

        if( paused ) return (Ao, ERR_PAUSED);

        if( Ao < Lo ) return (Ao, ERR_LIMIT_FAILED);

        return (Ao, ERR_NONE);
 
    }

    function trySwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao, byte err)
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

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, fee);
            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao)
    {
        byte err;
        
        (Ai, err) = trySwap_ExactInMinOut(Ti, Ai, To, Lo);
        check(err);
        return Ai;
    }

    function viewSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
      public view
        returns (uint Ai, byte err)
    {
        if( !isBound(Ti) ) return (0, ERR_NOT_BOUND);
        if( !isBound(To) ) return (0, ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ai = calc_InGivenOut( I.balance, I.weight
                            , O.balance, O.weight
                            , Ao, fee );

        if( paused ) return (Ai, ERR_PAUSED);

        if( Ai > Li ) return (Ai, ERR_LIMIT_FAILED);

        return (Ai, ERR_NONE);
    }

    function trySwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
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

            emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao, fee);
            return (Ai, ERR_NONE);
        }
    }

    function doSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
      public returns (uint Ai)
    {
        byte err;
        (Ai, err) = trySwap_MaxInExactOut(Ti, Li, To, Ao);
        check(err);
        return Ai;
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

        uint oldBalance = records[token].balance;
        records[token].balance = balance;

        if (balance > oldBalance) {
            bool ok = ERC20(token).transferFrom(msg.sender, address(this), balance - oldBalance);
            check(ok, ERR_ERC20_FALSE);
        } else {
            bool ok = ERC20(token).transfer(msg.sender, oldBalance - balance);
            check(ok, ERR_ERC20_FALSE);
        }

    }

    function setFee(uint fee_)
      public
        note {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(fee_ <= MAX_FEE, ERR_MAX_FEE);
        fee = fee_;
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
          , weight: 0
          , balance: 0
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

}
