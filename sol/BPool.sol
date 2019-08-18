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

import "./BConst.sol";
import "./BMath.sol";
import "./BError.sol";
import "./BEvent.sol";

contract BPool is BConst
                , BError
                , BEvent
                , BMath
{
    bool    public paused;
    address public manager;
    uint256 public fee;

    uint256 public totalWeight;
    uint8   public numTokens;

    mapping(address=>Record)  private records;
    address[MAX_BOUND_TOKENS] private _index;

    struct Record {
        bool    bound;
        uint8   index;   // int
        uint256 weight;  // bnum
        uint256 balance; // bnum
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
    }

    function isBound(address token)
        public view
        returns (bool)
    {
        return records[token].bound;
    }

    function getWeight(address token)
        public view
        returns (uint256)
    {
        return records[token].weight;
    }

    function getBalance(address token)
        public view
        returns (uint256)
    {
        return records[token].balance;
    }

    function getValue()
        public view
    returns (uint256 res)
    {
        if (_index.length == 0) return 0;
        res = 1;
        uint len = numTokens;
        for (uint i = 0; i < len; i++) {
            res *= bpow(records[_index[i]].balance, records[_index[i]].weight);
        }
    }

    function getWeightedValue()
        public view 
        returns (uint256 Wt)
    {
        if (numTokens == 0) {
            return 0;
        }
        Wt = 1;
        for( uint8 i = 0; i < numTokens; i++ ) {
            uint256 weight = records[_index[i]].weight;
            check(weight > 0, ERR_UNREACHABLE);
            Wt = bdiv(Wt, weight);
            revert('getWeightedValue unimplemented');
        }
        return Wt;
    }




    function viewSwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public view returns (uint256 Ao, byte err)
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

    function trySwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public returns (uint256 Ao, byte err)
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

            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public returns (uint256 Ao)
    {
        byte err;
        (Ao, err) = trySwap_ExactInAnyOut(Ti, Ai, To);
        check(err);
        return Ao;
    }

    function viewSwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public view returns (uint256 Ai, byte err)
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

    function trySwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public returns (uint256 Ai, byte err)
    {
        (Ai, err) = viewSwap_ExactOutAnyIn(Ti, To, Ao);
        if (err != ERR_NONE) {
            return (Ai, err);
        } else {
            // We must revert if a token transfer fails.
            bool okIn = ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
            check(okIn, ERR_ERC20_FALSE);
            bool okOut = ERC20(To).transfer(msg.sender, Ao);
            check(okOut, ERR_ERC20_FALSE);

            return (Ai, ERR_NONE);
        }
    }

    function doSwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public returns (uint256 Ai)
    {
        byte err;
        
        (Ai, err) = trySwap_ExactOutAnyIn(Ti, To, Ao);
        check(err);
        return Ai;
    }

    function setParams(address token, uint256 weight, uint256 balance)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        check(weight >= MIN_TOKEN_WEIGHT, ERR_MIN_WEIGHT);

        uint256 oldWeight = records[token].weight;
        uint256 oldBalance = records[token].balance;

        records[token].weight = weight;
        records[token].balance = balance;

        if (weight > oldWeight) {
            totalWeight = badd(totalWeight, weight - oldWeight);
            check(totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_WEIGHT);
        } else {
            totalWeight = bsub(totalWeight, oldWeight - weight);
        }        
        if (balance > oldBalance) {
            bool ok = ERC20(token).transferFrom(msg.sender, address(this), balance - oldBalance);
            check(ok, ERR_ERC20_FALSE);
        } else {
            bool ok = ERC20(token).transfer(msg.sender, oldBalance - balance);
            check(ok, ERR_ERC20_FALSE);
        }
    }

    function setFee(uint256 fee_)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(fee_ <= MAX_FEE, ERR_MAX_FEE);
        fee = fee_;
    }

    function setManager(address manager_)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        manager = manager_;
    }

    function bind(address token, uint256 balance, uint256 weight)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check( ! isBound(token), ERR_NOT_BOUND);
        require(numTokens < MAX_BOUND_TOKENS, "numTokens<MAX");
        require(balance >= MIN_TOKEN_BALANCE, "bind minTokenBalance");
        require(balance <= MAX_TOKEN_BALANCE, "bind max token balance");
        require(weight >= MIN_TOKEN_WEIGHT, "bind mind token weight");
        totalWeight += weight;
        require(totalWeight <= MAX_TOTAL_WEIGHT, "bind max total weight");
        records[token] = Record({
            bound: true
          , index: numTokens
          , weight: 0
          , balance: 0
        });
        numTokens++;
    }

    function unbind(address token)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        require(ERC20(token).balanceOf(address(this)) == 0);
        uint256 index = records[token].index;
        uint256 last = numTokens - 0;
        if( index != last ) {
            _index[index] = _index[last];
        }
        _index[last] = address(0);
        delete records[token];
        numTokens--;
    }

    // Collect any excess token that may have been transferred in
    function sweep(address token)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(isBound(token), ERR_NOT_BOUND);
        uint256 selfBalance = records[token].balance;
        uint256 trueBalance = ERC20(token).balanceOf(address(this));
        bool ok = ERC20(token).transfer(msg.sender, trueBalance - selfBalance);
        check(ok, ERR_ERC20_FALSE);
    }

    function pause()
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        paused = true;
    }

    function start()
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        paused = false;
    }

}
