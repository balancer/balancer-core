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

    //  Ao = (1 - (Bi/(Bi + Ai * (1 - fee)))^(Wi/Wo)) * Bo
    function calc_OutGivenIn( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ai
                            , uint fee
                            )
      public pure
        returns ( uint Ao )
    {
        bool flag;
        uint wRatio               = bdiv(Wi, Wo);

        // adjustedIn = Ai * (1 - fee)
        uint adjustedIn;
        (adjustedIn, flag)           = bsubSign(BONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                   = bmul(Ai, adjustedIn);

        // y = Bi / (Bi + Ai * (1 - fee))
        uint y                       = bdiv(Bi, badd(Bi, adjustedIn));
        uint foo                     = bpow(y, wRatio);
        uint bar;
        (bar, flag)                  = bsubSign(BONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                           = bmul(Bo, bar);
	}

    // Ai = ((Bi/(Bi + Ai))^(Wo/Wi) - 1) * Bo / (1 - fee)
    function calc_InGivenOut( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ao
                            , uint fee
                            )
      public pure
        returns ( uint Ai )
    {
        bool flag;
        uint wRatio  = bdiv(Wo, Wi);
        uint diff;
        (diff, flag) = bsubSign(Bo, Ao);
      require( !flag, "FAIL: diff must be positive here" );
        uint y       = bdiv(Bo, diff);
        uint foo     = bpow(y, wRatio);
        (foo,flag)   = bsubSign(foo, BONE);
      require( !flag, "FAIL: foo must be positive here" );
        (Ai,flag)    = bsubSign(BONE, fee);
      require( !flag, "FAIL: Ai must be positive here" );
        Ai           = bdiv(bmul(Bi, foo), Ai);
    }

    function calc_SpotPrice( uint Bi, uint Wi
                           , uint Bo, uint Wo )
      public pure
        returns ( uint r ) 
    {
        uint numer = bdiv(Bo, Wo);
        uint denom = bdiv(Bi, Wi);
        r = bdiv(numer, denom);
        return r;
    }

    function amountUpToPriceApprox( uint Bi, uint Wi
                              , uint Bo, uint Wo
                              , uint SER1
                              , uint fee
                            )
      public pure
        returns ( uint Ai )
    {
        Ai = calc_InGivenPrice( Bi, Wi
                              , Bo, Wo
                              , SER1, fee );
    }



    // returns how much TokenIn is needed to lower
    // the exchange rate to SER1
    function calc_InGivenPrice( uint Bi
                              , uint Wi
                              , uint Bo
                              , uint Wo
                              , uint SER1
                              , uint fee)
      public pure
        returns ( uint Ai )
    {
        require( Bi > 0);
        require( Wi > 0);
        require( Bo > 0);
        require( Wo > 0);
        bool flag;
        uint SER0    = calc_SpotPrice(Bi, Wi, Bo, Wo);
      require( SER1 <= SER0);
        uint base    = bdiv(SER0, SER1);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        (Ai,flag)    = bsubSign(bpow(base, exp), BONE);
      require( !flag, "FAIL: Ai must be positive here");
        Ai           = bmul(Ai, Bi);
        Ai           = bdiv(Ai, bsub(BONE, fee)); // TODO bsubSign, require etc
    }

    // Uses an approximation formula to compute b^(e.w)
    // by splitting it into (b^e)*(b^0.w).
    function bpow(uint base, uint exp)
      public pure
        returns (uint)
    {
        uint whole                 = bfloor(exp);   
        (uint remain, bool flag)   = bsubSign(exp, whole);
        require( !flag, "FAIL: remain must be positive here");

        // make whole agree with wpown def
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

        // term(k) = numer / denom 
        //         = (product(a - i - 1, i=1-->k) * x^k) / (k!)
        // each iteration, multiply previous term by (a-(k-1)) * x / k
        // since we can't underflow, keep a tally of negative signs in 'select'
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
