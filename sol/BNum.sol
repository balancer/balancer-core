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

contract BNum is DSMath {
    uint256 constant ONE = WAD;

    function wfloor(uint x) internal pure returns (uint z) {
        z = x / ONE * ONE;
    }

    function wsub(uint256 a, uint256 b) public pure returns (uint256, bool) {
        if (a >= b) {
            return (sub(a, b), false);
        } else {
            return (sub(b, a), true);
        }
    }

    function wadd(uint256 a, uint256 b) public pure returns (uint256) {
        return add(a, b);
    }

    function wpown(uint x, uint n) internal pure returns (uint z) {
        z = n % 2 != 0 ? x : ONE;

        for (n /= 2; n != 0; n /= 2) {
            x = wmul(x, x);

            if (n % 2 != 0) {
                z = wmul(z, x);
            }
        }
    }

    function wtoi(uint w) internal pure returns (uint) {
        return w / ONE;
    }

    function wpow(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 whole                 = wfloor(exp);   
        (uint256 remain, bool flag)   = wsub(exp, whole);
        require( !flag, "BMath.wpow");
        uint256 wholePow              = wpown(base, wtoi(whole));

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint256 a     = remain;
        uint256 numer = ONE;
        uint256 denom = ONE;
        uint256 sum   = ONE;
        (uint256 x, bool xneg)  = wsub(base, ONE);


        uint select = 0;
        for( uint i = 1; i < 20; i++) {
            uint256 k = i * ONE;
            
            (uint256 c, bool cneg) = wsub(a, sub(k, ONE));
            numer    = wmul(numer, wmul(c, x));
            denom    = wmul(denom, k);
            if (xneg) select += 1;
            if (cneg) select += 1;
            if (select % 2 == 1) {
                sum      = sub(sum, wdiv(numer, denom));
            } else {
                sum      = add(sum, wdiv(numer, denom));
            }
        }

        return wmul(sum, wholePow);
    }

}
