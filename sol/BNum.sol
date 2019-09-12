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

pragma solidity ^0.5.11;

import "./BColor.sol";
import "./BConst.sol";

contract BNum is BBronze, BConst {

    function btoi(uint a) internal pure returns (uint) {
        return a / BONE;
    }

    function bfloor(uint a) internal pure returns (uint) {
        return btoi(a) * BONE;
    }

    function badd(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a, ERR_ADD_OVERFLOW);
        return c;
    }

    function bsub(uint a, uint b) internal pure returns (uint) {
        (uint c, bool flag) = bsubSign(a, b);
        require(!flag, ERR_SUB_UNDERFLOW);
        return c;
    }

    function bsubSign(uint a, uint b) internal pure returns (uint, bool) {
        if (a >= b) {
            return (a - b, false);
        } else {
            return (b - a, true);
        }
    }

    function bmul(uint a, uint b) internal pure returns (uint) {
        uint c0 = a * b;
        require(a == 0 || c0 / a == b, ERR_MUL_OVERFLOW);
        uint c1 = c0 + (BONE / 2);
        require(c1 >= c0, ERR_MUL_OVERFLOW);
        uint c2 = c1 / BONE;
        return c2;
    }

    function bdiv(uint a, uint b) internal pure returns (uint) {
        require(b != 0, ERR_DIV_ZERO);
        uint c0 = a * BONE;
        require(a == 0 || c0 / a == BONE, ERR_DIV_INTERNAL); // bmul overflow
        uint c1 = c0 + (b / 2);
        require(c1 >= c0, ERR_DIV_INTERNAL); //  badd require
        uint c2 = c1 / b;
        return c2;
    }

    // DSMath.wpow
    function bpowi(uint a, uint n) internal pure returns (uint) {
        uint z = n % 2 != 0 ? a : BONE;

        for (n /= 2; n != 0; n /= 2) {
            a = bmul(a, a);

            if (n % 2 != 0) {
                z = bmul(z, a);
            }
        }
        return z;
    }


}
