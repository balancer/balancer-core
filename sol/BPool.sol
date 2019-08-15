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
import "./BErr.sol";
import "./BLog.sol";

contract BPool is BConst
                //, BMath // TODO better linearization
                , BErr
                , BLog
{
    bool                      public paused;
    address                   public manager;
    uint256                   public fee;

    uint256                   public totalWeight;
    uint8                     public numTokens;
    mapping(address=>Record)  public records;
    address[MAX_BOUND_TOKENS] private _index;

    struct Record {
        bool    bound;
        uint8   index;   // int
        uint256 weight;  // WAD
        uint256 balance; // WAD
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
    }

    function viewSwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public view returns (uint256 Ao, byte err)
    {
        check(isBound(Ti), ERR_NOT_BOUND);
        check(isBound(To), ERR_NOT_BOUND);

        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        Ao = swapImath( I.balance, I.weight
                      , O.balance, O.weight
                      , Ai, fee );

        if( paused ) {
            return (Ao, ERR_PAUSED);
        }

        return (Ao, ERR_NONE);
    }

    function trySwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public returns (uint256 Ao, byte err)
    {
        (Ao, err) = viewSwap_ExactInAnyOut(Ti, Ai, To);
        if (err != ERR_NONE) {
            return (Ao, err);
        } else {
            require( ERC20(Ti).transferFrom(msg.sender, address(this), Ai), "xfer" );
            require( ERC20(To).transfer(msg.sender, Ao), "xfer" );
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


    function swapO(address Ti, address To, uint256 Ao)
        public returns (uint256 Ai)
    {
        Ti = Ti; To = To; Ai = Ao; fee = Ao; // hide warnings
        revert("unimplemented");
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
            totalWeight = add(totalWeight, weight - oldWeight);
            check(totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_WEIGHT);
        } else {
            totalWeight = sub(totalWeight, oldWeight - weight);
        }        
        if (balance > oldBalance) {
            bool ok = ERC20(token).transferFrom(msg.sender, address(this), balance - oldBalance);
            check(ok, ERR_ERC20_FALSE);
        } else {
            bool ok = ERC20(token).transfer(msg.sender, oldBalance - balance);
            check(ok, ERR_ERC20_FALSE);
        }
    }

    function setBalanceFixRatio(address token, uint256 balance)
        public
        note
    {
        uint256 oldBalance = records[token].balance;
        uint256 oldWeight = records[token].weight;
        uint256 oldRatio = 0;
        uint256 newWeight = 0;
        setParams(token, newWeight, balance);
        revert("unimplemented");
    }
    function setWeightFixRatio(address token, uint256 weight)
        public
        note
    {
        uint256 oldBalance = records[token].balance;
        uint256 oldWeight = records[token].weight;
        uint256 oldRatio = 0;
        uint256 newBalance = 0;
        setParams(token, weight, newBalance);
        revert("unimplemented");
    }

    function setFee(uint256 fee_)
        public
        note
    {
        check(msg.sender == manager, ERR_BAD_CALLER);
        check(fee_ <= MAX_FEE, ERR_MAX_FEE);
        fee = fee_;
    }

    function isBound(address token)
        public view
        returns (bool)
    {
        return records[token].bound;
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
            Wt = wdiv(Wt, weight);
            revert('getWeightedValue unimplemented');
        }
        return Wt;
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
