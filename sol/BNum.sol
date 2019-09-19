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

    function bpow(uint base, uint exp)
      pure internal
        returns (uint)
    {
        return bpowK(base, exp, APPROX_ITERATIONS);
    }

    event print(string s);
    event print(uint256 u);
    event print(uint256 u, string s);

    // Uses an approximation formula to compute b^(e.w)
    // by splitting it into (b^e)*(b^0.w).
    function bpowK(uint base, uint exp, uint K)
      pure internal
        returns (uint)
    {
        require(exp != 0 || base != 0, ERR_BPOW_BASE_TOO_LOW);
        require(base <= MAX_BPOW_BASE, ERR_BPOW_BASE_TOO_HIGH);

        uint whole  = bfloor(exp);   
        uint remain = bsub(exp, whole);

        // make whole agree with bpowi definition
        uint intExp = btoi(whole);
        uint wholePow = bpowi(base, intExp); 

        if (remain == 0) {
            return wholePow;
        }

        // TODO range check on sign conversion
        int ibase = int256(base);
        int iexp = int256(exp);
        int iBONE = int256(BONE);

        int a = iexp;
        int x = ibase - iBONE;

        int acc = (a * x) / iBONE;
        int result = iBONE + acc;

        emit print('test');
        for( uint k = 0; k < K; k++ ) {
            int bigK = iBONE * int256(k);

            // result += acc*(a-(k-1))*x / k
            int boo = a - (bigK - iBONE);
            int bar = (((acc * boo) / iBONE) * x) / iBONE;
            int baz = (bar / bigK);
            result += baz;

            // acc = acc * a * x / k
            int zoo = (acc * (a * x / iBONE)) / iBONE;
            int zar = (zoo * bigK) / iBONE;
            acc = zar;
        }

        return uint256(result);

    }

}
