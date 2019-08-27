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
import "./BError.sol";

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
       
      check( Bi > 0,  ERR_MIN_BALANCE);
      check( Wi > 0,  ERR_MIN_WEIGHT);
      check( Bo > 0,  ERR_MIN_BALANCE);
      check( Wo > 0,  ERR_MIN_WEIGHT);
      check( fee < BONE, ERR_MAX_FEE );

        bool flag;
        uint wRatio               = bdiv(Wi, Wo);

        // adjustedIn = Ai * (1 - fee)
        uint adjustedIn;
        (adjustedIn, flag)           = bsubSign(BONE, fee);
      check( !flag, ERR_MAX_FEE );
        adjustedIn                   = bmul(Ai, adjustedIn);

        // y = Bi / (Bi + Ai * (1 - fee))
        uint y                       = bdiv(Bi, badd(Bi, adjustedIn));
        uint foo                     = bpow(y, wRatio);
        uint bar;
        (bar, flag)                  = bsubSign(BONE, foo);
      check( !flag, ERR_MATH_SUB_UNDERFLOW ); //TODO: MAX_SLIP
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
      check( Bi > 0,  ERR_MIN_BALANCE);
      check( Wi > 0,  ERR_MIN_WEIGHT);
      check( Bo > 0,  ERR_MIN_BALANCE);
      check( Wo > 0,  ERR_MIN_WEIGHT);
      check( Ao < Bo, ERR_MAX_TRADE );
      check( fee < BONE, ERR_MAX_FEE );
 
        bool flag;
        uint wRatio  = bdiv(Wo, Wi);
        uint diff;
        (diff, flag) = bsubSign(Bo, Ao);
      check( !flag, ERR_MATH_SUB_UNDERFLOW ); //TODO: replace with MAX_SLIP or something
        uint y       = bdiv(Bo, diff);
        uint foo     = bpow(y, wRatio);
        (foo,flag)   = bsubSign(foo, BONE);
      check( !flag, ERR_MATH_SUB_UNDERFLOW ); //TODO: Ao > Bo (MAX_SLIP)
        (Ai,flag)    = bsubSign(BONE, fee);
      check( !flag, ERR_MATH_SUB_UNDERFLOW ); //TODO: MAX_SLIP
        Ai           = bdiv(bmul(Bi, foo), Ai);
    }

    function calc_SpotPrice( uint Bi, uint Wi
                           , uint Bo, uint Wo )
      public pure
        returns ( uint r ) 
    {
      check( Bi > 0, ERR_MIN_BALANCE);
      check( Wi > 0, ERR_MIN_WEIGHT);
      check( Bo > 0, ERR_MIN_BALANCE);
      check( Wo > 0, ERR_MIN_WEIGHT);

        uint numer = bdiv(Bo, Wo);
        uint denom = bdiv(Bi, Wi);
      check( denom > 0, ERR_MATH_DIV_ZERO );
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
      check( Bi > 0,  ERR_MIN_BALANCE);
      check( Wi > 0,  ERR_MIN_WEIGHT);
      check( Bo > 0,  ERR_MIN_BALANCE);
      check( Wo > 0,  ERR_MIN_WEIGHT);
      check( fee < BONE, ERR_MAX_FEE );

        bool flag;
        uint SER0    = calc_SpotPrice(Bi, Wi, Bo, Wo);
      check( SER1 <= SER0, ERR_MATH_SUB_UNDERFLOW ); // target spot price too high
        uint base    = bdiv(SER0, SER1);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        (Ai,flag)    = bsubSign(bpow(base, exp), BONE);
      check( !flag, ERR_MATH_SUB_UNDERFLOW );
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
      check( !flag, ERR_MATH_SUB_UNDERFLOW );

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
