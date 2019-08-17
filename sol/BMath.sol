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

    function calc_OutGivenIn( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ai
                            , uint fee
                            )
        public pure
        returns ( uint Ao )
    {
        bool flag;
        uint wRatio                         = bdiv(Wi, Wo);
        uint adjustedIn;
        (adjustedIn, flag)                  = bsubSign(BONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                          = bmul(Ai, adjustedIn);
        uint y                              = bdiv(Bi, badd(Bi, adjustedIn));
        uint foo                            = bpow(y, wRatio);
        uint bar;
        (bar, flag)                         = bsubSign(BONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                                  = bmul(Bo, bar);
	}

    function swapOmath( uint Bi, uint Wi
                      , uint Bo, uint Wo
                      , uint Ao
                      , uint fee
                      )
        public pure
        returns ( uint Ai )
    {
        bool flag;
        uint wRatio                         = bdiv(Wo, Wi);
        uint diff;
        (diff, flag)                        = bsubSign(Bo, Ao);
        require( !flag, "BMath.swapOmath");
        uint y                              = bdiv(Bo, diff);
        uint foo                            = bpow(y, wRatio);
        (foo,flag)                          = bsubSign(foo, BONE);
        require( !flag, "BMath.swapOmath");
        (Ai,flag)                           = bsubSign(BONE, fee);
        require( !flag, "BMath.swapOmath");
        Ai                                  = bdiv(bmul(Bi, foo), Ai);
    }

    function spotPrice( uint Bi, uint Wi
                      , uint Bo, uint Wo )
        public pure
        returns ( uint r ) 
    {
        uint numer = bdiv(Bo, Wo);
        uint denom = bdiv(Bi, Wi);
        r = bdiv(numer, denom);
        return r;
    }

    function amountUpToPriceApprox( uint Bi
                                  , uint Wi
                                  , uint Bo
                                  , uint Wo
                                  , uint SER1
                                  , uint fee)
        public pure
        returns ( uint Ai )
    {
        bool flag;
        uint SER0 = spotPrice(Bi, Wi, Bo, Wo);
        uint base = bdiv(SER0, SER1);
        uint exp  = bdiv(Wo, badd(Wo, Wi));
        (Ai,flag) = bsubSign(bpow(base, exp), BONE);
        require( !flag, "BMath.amountUpToPriceApprox");
        Ai        = bmul(Ai, Bi);
        Ai        = bdiv(Ai, bsub(BONE, fee)); // TODO bsubSign, require etc
    }

    function bpow(uint base, uint exp) public pure returns (uint)
    {
        uint whole                 = bfloor(exp);   
        (uint remain, bool flag)   = bsubSign(exp, whole);
        require( !flag, "BMath.bpow");
        uint wholePow              = bpown(base, btoi(whole));

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint a     = remain;
        uint numer = BONE;
        uint denom = BONE;
        uint sum   = BONE;
        (uint x, bool xneg)  = bsubSign(base, BONE);

        uint select = 0;
        for( uint i = 1; i < 20; i++) {
            uint k = i * BONE;
            
            (uint c, bool cneg) = bsubSign(a, bsub(k, BONE));
            numer               = bmul(numer, bmul(c, x));
            denom               = bmul(denom, k);
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
