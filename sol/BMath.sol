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

import "./BNum.sol";

contract BMath is BNum
{
    // Names
    // Bi := Balance In
    // Bo := Balance Out
    // Wi := Weight In
    // Wo := Weight Out
    // Ai := Amount In
    // Ao := Amount Out
    // Ti := Token In
    // To := Token Out

    function swapImath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ai
                      , uint256 fee
                      )
        public pure
        returns ( uint256 Ao )
    {
        bool flag;
        uint256 wRatio               = bdiv(Wi, Wo);
        uint256 adjustedIn;
        (adjustedIn, flag)           = bsubSign(BONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                   = bmul(Ai, adjustedIn);
        uint256 y                    = bdiv(Bi, badd(Bi, adjustedIn));
        uint256 foo                  = bpow(y, wRatio);
        uint256 bar;
        (bar, flag)                  = bsubSign(BONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                           = bmul(Bo, bar);
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
        uint256 wRatio     = bdiv(Wo, Wi);
        uint256 diff;
        (diff, flag)       = bsubSign(Bo, Ao);
        require( !flag, "BMath.swapOmath");
        uint256 y          = bdiv(Bo, diff);
        uint256 foo        = bpow(y, wRatio);
        (foo,flag)         = bsubSign(foo, BONE);
        require( !flag, "BMath.swapOmath");
        (Ai,flag)          = bsubSign(BONE, fee);
        require( !flag, "BMath.swapOmath");
        Ai                 = bdiv(bmul(Bi, foo), Ai);
    }

    function spotPrice( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo )
        public pure
        returns ( uint256 r ) 
    {
        uint256 numer = bdiv(Bo, Wo);
        uint256 denom = bdiv(Bi, Wi);
        r = bdiv(numer, denom);
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
        uint256 base = bdiv(SER0, SER1);
        uint256 exp  = bdiv(Wo, badd(Wo, Wi));
        (Ai,flag)    = bsubSign(bpow(base, exp), BONE);
        require( !flag, "BMath.amountUpToPriceApprox");
        Ai           = bmul(Ai, Bi);
        Ai           = bdiv(Ai, bsub(BONE, fee)); // TODO bsubSign, require etc
    }

    function bpow(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 whole                 = bfloor(exp);   
        (uint256 remain, bool flag)   = bsubSign(exp, whole);
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
        (uint256 x, bool xneg)  = bsubSign(base, BONE);

        uint select = 0;
        for( uint i = 1; i < 20; i++) {
            uint256 k = i * BONE;
            
            (uint256 c, bool cneg) = bsubSign(a, bsub(k, BONE));
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
