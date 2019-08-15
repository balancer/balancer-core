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

contract BError {
    bytes32 constant internal ERR_NONE      = bytes32(uint256(0x0));
    bytes32 constant internal ERR_PAUSED    = bytes32(uint256(0x1));
    bytes32 constant internal ERR_NOT_BOUND = bytes32(uint256(0x2));
    
    bytes32[1] errs;
 
    constructor() public {
        errs[uint256(ERR_NONE)] = "ERR_NONE";
    }
    
    function chuck(bytes32 errcode) public {
    }
}
