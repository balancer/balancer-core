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

import "./BEvent.sol";
import "./BError.sol";
import "./BNum.sol";

contract BCoin is BEvent
                , BError
                , BNum
{
    address                     public owner;
    mapping(address=>uint256)   public balanceOf;
    mapping(address=>
        mapping(address=>bool)) public trusts;

    constructor(address erc20) public {
        owner = msg.sender;
        inner = erc20;
    }

    function move(address src, address dst, uint256 amt) public {
        check( msg.sender == owner
            || msg.sender == src
            || trusts[src][address(this)]
          , ERR_BAD_CALLER);
        balanceOf[src] = bsub(balanceOf[src], amt);
        balanceOf[dst] = badd(balanceOf[dst], amt);
    }

    function trust(address whom, bool t) public {
        trusts[msg.sender][whom] = t;
    }
}
