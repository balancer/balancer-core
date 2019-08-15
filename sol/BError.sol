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

import "ds-math/math.sol";

// `pure internal` operating on constants should get fully optimized by compiler

contract BError {
    bytes32 constant ERR_NONE      = bytes32(uint256( 0x00 ));
    bytes32 constant ERR_PAUSED    = bytes32(uint256( 0x01 ));
    bytes32 constant ERR_NOT_BOUND = bytes32(uint256( 0x02 ));
    
    function serr(bytes32 berr)
        pure internal
        returns (string memory)
    {
        if( berr == ERR_NONE )
            return "ERR_NONE";
        return "err-meta--unkown-berr";
    }
   
    function check(bool cond, bytes32 berr)
        pure internal
    {
        if(!cond)
            chuck(berr);
    }

    // like throw haha 
    function chuck(bytes32 berr)
        pure internal
    {
        revert(serr(berr));
    }
}
