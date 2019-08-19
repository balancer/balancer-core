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

import 'ds-note/note.sol';

import "./BBronze.sol";
import "./BNum.sol";

contract BToken is BBronze
                 , BNum
                 , DSNote
{
    address                     public owner;
    mapping(address=>uint)      public balanceOf;
    mapping(address=>
        mapping(address=>bool)) public trusts;

    constructor() public {
        owner = msg.sender;
    }

    //== Redundant ERC20-compatible event and functions

    // `move` still `note`s, because `Transfer` event does not record caller
    event Transfer(address indexed from, address indexed to, uint amount);

    function transfer(address to, uint amt) public returns (bool) {
        move(address(this), to, amt);
        return true; // hmm
    }
    function transferFrom(address src, address dst, uint amt) public returns (bool) {
        move(src, dst, amt);
        return true; // Ethereum Standard Request For Comment Number 20
    }
    //--

    function move(address src, address dst, uint amt)
      public note {
        require( trusts[src][msg.sender]
              || msg.sender == src
              || msg.sender == owner
        , "ERR_BAD_CALLER" );
        balanceOf[src] = bsub(balanceOf[src], amt);
        balanceOf[dst] = badd(balanceOf[dst], amt);
    }

    function mint(uint amt)
      public {
        mint(msg.sender, amt);
    }

    function mint(address dst, uint amt)
      public note {
        check( msg.sender == owner, ERR_BAD_CALLER );
        balanceOf[dst] = badd(balanceOf[dst], amt);
    }

    function burn()
      public note {
        balanceOf[address(this)] = 0;
    }

    function burn(uint amt)
      public note {
        balanceOf[msg.sender] = bsub(balanceOf[msg.sender], amt);
    }

    function trust(address whom, bool t)
      public note {
        trusts[msg.sender][whom] = t;
    }
}
