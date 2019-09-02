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

// A BNum is a fixed-point number with 10**18 decimals of precision
// It is inspired by and roughly equivalent to a `wad` type from
// dapphub/ds-math@784079b72c4d782b022b3e893a7c5659aa35971a

pragma solidity ^0.5.10;

import "./BError.sol";
import "./BConst.sol";

contract BNum is BConst
               , BError
{
    function btoi(uint a) internal pure returns (uint) {
        return a / BONE;
    }

    function badd(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        check(c >= a, ERR_MATH_ADD_OVERFLOW);
        return c;
    }

    function bsub(uint a, uint b) internal pure returns (uint) {
        (uint c, bool flag) = bsubSign(a, b);
        check(!flag, ERR_MATH_SUB_UNDERFLOW);
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
        check(a == 0 || c0 / a == b, ERR_MATH_MUL_OVERFLOW);
        uint c1 = c0 + (BONE / 2);
        check(c1 >= c0, ERR_MATH_MUL_OVERFLOW);
        uint c2 = c1 / BONE;
        return c2;
    }

    function bdiv(uint a, uint b) internal pure returns (uint) {
        check(b != 0, ERR_MATH_DIV_ZERO);
        uint c0 = a * BONE;
        check(a == 0 || c0 / a == BONE, ERR_MATH_DIV_INTERNAL); // bmul check
        uint c1 = c0 + (b / 2);
        check(c1 >= c0, ERR_MATH_DIV_INTERNAL); //  badd check
        uint c2 = c1 / b;
        return c2;
    }

    // DSMath.wpow
    function bpown(uint a, uint n) internal pure returns (uint) {
        uint z = n % 2 != 0 ? a : BONE;

        for (n /= 2; n != 0; n /= 2) {
            a = bmul(a, a);

            if (n % 2 != 0) {
                z = bmul(z, a);
            }
        }
        return z;
    }

    function bfloor(uint a) internal pure returns (uint) {
        return (a / BONE) * BONE;
    }

}
