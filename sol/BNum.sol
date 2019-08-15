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

contract BNum is BError
{
    uint256 constant BONE = 10**18;

    function bfloor(uint x) internal pure returns (uint z) {
        z = x / BONE * BONE;
    }

    function badd(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 c = a + b;
        check(c >= a, ERR_MATH_ADD_OVERFLOW);
        return c;
    }

    function bsub(uint256 a, uint256 b) public pure returns (uint256) {
        (uint256 c, bool flag) = bsubTry(a, b);
        check(!flag, ERR_MATH_SUB_UNDERFLOW);
        return c;
    }

    function bsubTry(uint256 a, uint256 b) public pure returns (uint256, bool) {
        if (a >= b) {
            return (a - b, false);
        } else {
            return (b - a, true);
        }
    }

    function bmul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c0 = a * b;
        check(a == 0 || c0 / a == b, ERR_MATH_MUL_OVERFLOW);
        uint256 c1 = c0 + (BONE / 2);
        check(c1 >= c0, ERR_MATH_MUL_OVERFLOW);
        uint256 c2 = c1 / BONE;
        return c2;
    }

    function bdiv(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c0 = a * BONE;
        check(a == 0 || c0 / a == BONE, ERR_MATH_DIV_INTERFLOW);
        uint256 c1 = c0 + (b / 2);
        check(c1 >= c0, ERR_MATH_DIV_INTERFLOW);
        uint256 c2 = c1 / b;
        return c2;
    }


    function bpown(uint x, uint n) internal pure returns (uint z) {
        z = n % 2 != 0 ? x : BONE;

        for (n /= 2; n != 0; n /= 2) {
            x = bmul(x, x);

            if (n % 2 != 0) {
                z = bmul(z, x);
            }
        }
    }

    function btoi(uint w) internal pure returns (uint) {
        return w / BONE;
    }

    function bpow(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 whole                 = bfloor(exp);   
        (uint256 remain, bool flag)   = bsubTry(exp, whole);
        require( !flag, "BMath.bpow");
        uint256 wholePow              = bpown(base, btoi(whole));

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint256 a     = remain;
        uint256 numer = BONE;
        uint256 denom = BONE;
        uint256 sum   = BONE;
        (uint256 x, bool xneg)  = bsubTry(base, BONE);


        uint select = 0;
        for( uint i = 1; i < 20; i++) {
            uint256 k = i * BONE;
            
            (uint256 c, bool cneg) = bsubTry(a, bsub(k, BONE));
            numer    = bmul(numer, bmul(c, x));
            denom    = bmul(denom, k);
            if (xneg) select += 1;
            if (cneg) select += 1;
            if (select % 2 == 1) {
                sum      = bsub(sum, bdiv(numer, denom));
            } else {
                sum      = badd(sum, bdiv(numer, denom));
            }
        }

        return bmul(sum, wholePow);
    }

}
