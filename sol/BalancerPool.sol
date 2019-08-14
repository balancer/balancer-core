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
import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BalancerMath.sol";

contract BalancerPool is BalancerMath
                       , DSNote
{
    bool                      public paused;
    address                   public manager;
    uint256                   public feeRatio;
    uint256                   public unclaimedFees;

    mapping(address=>Record)  public records;

    struct Record {
        bool    bound;
        ERC20   addr;
        uint256 weight;  // RAY
        uint256 balance; // WAD
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
    }

    function swapI(ERC20 Ti, uint256 Ai, ERC20 To)
        public returns (uint256 Ao)
    {
        require( ! paused, "balancer-swapI-paused");
        require(isBound(Ti), "balancer-swapI-token-not-bound");
        require(isBound(To), "balancer-swapI-token-not-bound");
        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        (uint256 trueIn, bool n) = wsub(Ai, wmul(Ai, feeRatio));
        require( !n, "balancer-swapI-critical");
    
        Ao = swapImath( I.balance, I.weight
                      , O.balance, O.weight
                      , trueIn, feeRatio );

        ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
        ERC20(To).transfer(msg.sender, Ao);
        
        return Ao;
    }
    function swapO(ERC20 Ti, ERC20 To, uint256 Ao)
        public returns (uint256 Ai)
    {
        Ti = Ti; To = To; Ai = Ao; feeRatio = Ao; // hide warnings
        revert("unimplemented");
    }

    function setFee(uint256 feeRatio_)
        note
        public
    {
        require(msg.sender == manager);
        feeRatio = feeRatio_;
    }
    function setParams(ERC20 token, uint256 weight, uint256 balance)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        records[address(token)].weight = weight;
        uint256 oldBalance = records[address(token)].balance;
        records[address(token)].balance = balance;
        if (balance > oldBalance) {
            token.transferFrom(msg.sender, address(this), balance - oldBalance);
        } else {
            token.transfer(msg.sender, oldBalance - balance);
        }
    }

    function isBound(ERC20 token) public view returns (bool) {
        return records[address(token)].bound;
    }

    function bind(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require( ! isBound(token));
        records[address(token)] = Record({
            addr: token
          , bound: true
          , weight: 0
          , balance: 0
        });
    }
    function unbind(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        require(token.balanceOf(address(this)) == 0); // use `setWeight` and `sweep`
        delete records[address(token)];
    }
    // Collect fees and any excess token that may have been transferred in
    function sweep(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        uint256 selfBalance = records[address(token)].balance;
        uint256 trueBalance = token.balanceOf(address(this));
        token.transfer(msg.sender, trueBalance - selfBalance);
    }
    function pause()
        note
        public
    {
        assert(msg.sender == manager);
        paused = true;
    }
    function start()
        note
        public
    {
        assert(msg.sender == manager);
        paused = false;
    }
}
