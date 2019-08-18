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

contract BConst
{
    bytes8  constant COLOR             = "BRONZE";
    uint8   constant MAX_BOUND_TOKENS  = 8;
    uint256 constant BONE              = 10**18;
    uint256 constant MAX_FEE           = BONE / 10;
    uint256 constant MIN_TOKEN_WEIGHT  = BONE / 100;
    uint256 constant MAX_TOKEN_WEIGHT  = BONE * 10;
    uint256 constant MAX_TOTAL_WEIGHT  = BONE * 100; // total
    uint256 constant MIN_TOKEN_BALANCE = BONE / 100;
    uint256 constant MAX_TOKEN_BALANCE = BONE * BONE;
}
