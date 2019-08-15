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

import "./BMath.sol";

contract BPool is BMath
                , DSNote
{
    uint8   constant public MAX_BOUND_TOKENS  = 8;
    uint256 constant public MIN_TOKEN_WEIGHT  = WAD / 100;
    uint256 constant public MAX_TOTAL_WEIGHT  = WAD * 100;
    uint256 constant public MIN_TOKEN_BALANCE = WAD / 100;
    uint256 constant public MAX_TOKEN_BALANCE = WAD * WAD;

    bytes32 constant private ERR_NONE             = bytes32("ERR_NONE");
    bytes32 constant private ERR_PAUSED           = bytes32("ERR_PAUSED");
    bytes32 constant private ERR_NOT_BOUND        = bytes32("ERR_NOT_BOUND");


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
        ERC20   token;
        uint256 weight;  // WAD
        uint256 balance; // WAD
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
    }

    function viewSwap_ExactInAnyOut(ERC20 Ti, uint256 Ai, ERC20 To)
        public view returns (uint256 Ao, bytes32 err)
    {
        if( ! isBound(Ti)) { return (0, ERR_NOT_BOUND); }
        if( ! isBound(To)) { return (0, ERR_NOT_BOUND); }

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

    function trySwap_ExactInAnyOut(ERC20 Ti, uint256 Ai, ERC20 To)
        public returns (uint256 Ao, bytes32 err)
    {
        (Ao, err) = viewSwap_ExactInAnyOut(Ti, Ai, To);
        if (err != ERR_NONE) {
            return (Ao, err);
        } else {
            require( ERC20(Ti).transferFrom(msg.sender, address(this), Ai) );
            require( ERC20(To).transfer(msg.sender, Ao) );
            return (Ao, ERR_NONE);
        }
    }

    function doSwap_ExactInAnyOut(ERC20 Ti, uint256 Ai, ERC20 To)
        public returns (uint256 Ao)
    {
        bytes32 err;
        (Ao, err) = trySwap_ExactInAnyOut(Ti, Ai, To);
        require(err == ERR_NONE);
        return Ao;
    }


    function swapO(ERC20 Ti, ERC20 To, uint256 Ao)
        public returns (uint256 Ai)
    {
        Ti = Ti; To = To; Ai = Ao; fee = Ao; // hide warnings
        revert("unimplemented");
    }

    function setFee(uint256 fee_)
        public
        note
    {
        require(msg.sender == manager);
        fee = fee_;
    }
    function setParams(ERC20 token, uint256 weight, uint256 balance)
        public
        note
    {
        require(msg.sender == manager);
        require(isBound(token));
        require(weight >= MIN_TOKEN_WEIGHT);

        uint256 oldWeight = records[address(token)].weight;
        uint256 oldBalance = records[address(token)].balance;

        records[address(token)].weight = weight;
        records[address(token)].balance = balance;

        if (weight > oldWeight) {
            totalWeight = add(totalWeight, weight - oldWeight);
            require(totalWeight <= MAX_TOTAL_WEIGHT);
        } else {
            totalWeight = sub(totalWeight, oldWeight - weight);
        }        
        if (balance > oldBalance) {
            token.transferFrom(msg.sender, address(this), balance - oldBalance);
        } else {
            token.transfer(msg.sender, oldBalance - balance);
        }
    }

    function isBound(ERC20 token)
        public view
        returns (bool)
    {
        return records[address(token)].bound;
    }

    function bind(ERC20 token, uint256 balance, uint256 weight)
        public
        note
    {
        require(msg.sender == manager);
        require( ! isBound(token));
        require(numTokens < MAX_BOUND_TOKENS);
        require(balance >= MIN_TOKEN_BALANCE);
        require(balance <= MAX_TOKEN_BALANCE);
        require(weight >= MIN_TOKEN_WEIGHT);
        totalWeight += weight;
        require(totalWeight <= MAX_TOTAL_WEIGHT);
        records[address(token)] = Record({
            bound: true
          , index: numTokens
          , token: token
          , weight: 0
          , balance: 0
        });
        numTokens++;
    }
    function unbind(ERC20 token)
        public
        note
    {
        require(msg.sender == manager);
        require(isBound(token));
        require(token.balanceOf(address(this)) == 0);
        uint256 index = records[address(token)].index;
        uint256 last = numTokens - 0;
        if( index != last ) {
            _index[index] = _index[last];
        }
        _index[last] = address(0);
        delete records[address(token)];
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
            require(weight > 0, "unreachable, bound token with zero weight");
            // TODO enforce this on bind, setWeight etc ^^
            Wt = wdiv(Wt, weight); // TODO
        }
        return Wt;
    }

    // Collect any excess token that may have been transferred in
    function sweep(ERC20 token)
        public
        note
    {
        require(msg.sender == manager);
        require(isBound(token));
        uint256 selfBalance = records[address(token)].balance;
        uint256 trueBalance = token.balanceOf(address(this));
        token.transfer(msg.sender, trueBalance - selfBalance);
    }
    function pause()
        public
        note
    {
        assert(msg.sender == manager);
        paused = true;
    }
    function start()
        public
        note
    {
        assert(msg.sender == manager);
        paused = false;
    }
}
