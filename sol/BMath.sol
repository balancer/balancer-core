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

// Bi := Balance In
// Bo := Balance Out
// Wi := Weight In
// Wo := Weight Out
// Ai := Amount In
// Ao := Amount Out
// Ti := Token In
// To := Token Out

contract BMath is DSMath
{
    uint256 constant ONE = WAD;

    function swapImath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ai
                      , uint256 fee
                      )
        public pure
        returns ( uint256 Ao )
    {
        bool flag;
        uint256 wRatio               = wdiv(Wi, Wo);
        uint256 adjustedIn;
        (adjustedIn, flag)           = wsub(ONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                   = wmul(Ai, adjustedIn);
        uint256 y                    = wdiv(Bi, wadd(Bi, adjustedIn));
        uint256 foo                  = wpow(y, wRatio);
        uint256 bar;
        (bar, flag)                  = wsub(ONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                           = wmul(Bo, bar);
	}

    function swapOmath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ao
                      , uint256 fee
                      )
        public pure
        returns ( uint256 Ai )
    {
        bool flag;
        uint256 wRatio     = wdiv(Wo, Wi);
        uint256 diff;
        (diff, flag)       = wsub(Bo, Ao);
        require( !flag, "BMath.swapOmath");
        uint256 y          = wdiv(Bo, diff);
        uint256 foo        = wpow(y, wRatio);
        (foo,flag)         = wsub(foo, ONE);
        require( !flag, "BMath.swapOmath");
        (Ai,flag)             = wsub(ONE, fee);
        require( !flag, "BMath.swapOmath");
        Ai                 = wdiv(wmul(Bi, foo), Ai);
    }

    function spotPrice( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo )
        public pure
        returns ( uint256 r ) 
    {
        uint256 numer = wdiv(Bo, Wo);
        uint256 denom = wdiv(Bi, Wi);
        r = wdiv(numer, denom);
        return r;
    }

    function amountUpToPriceApprox( uint256 Bi
                                  , uint256 Wi
                                  , uint256 Bo
                                  , uint256 Wo
                                  , uint256 SER1
                                  , uint256 fee)
        public pure
        returns ( uint256 Ai )
    {
        bool flag;
        uint256 SER0 = spotPrice(Bi, Wi, Bo, Wo);
        uint256 base = wdiv(SER0, SER1);
        uint256 exp  = wdiv(Wo, add(Wo, Wi));
        (Ai,flag) = wsub(wpow(base, exp), ONE);
        require( !flag, "BMath.amountUpToPriceApprox");
        Ai = wmul(Ai, Bi);
        Ai = wdiv(Ai, sub(ONE, fee)); // TODO wsub, require etc
    }

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
