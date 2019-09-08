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
        uint wRatio     = bdiv(Wi, Wo);
        uint adjustedIn = bsub(BONE, fee);
             adjustedIn = bmul(Ai, adjustedIn);
        uint y          = bdiv(Bi, badd(Bi, adjustedIn));
        uint foo        = bpow(y, wRatio);
        uint bar        = bsub(BONE, foo);
             Ao         = bmul(Bo, bar);
        return Ao;
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
        uint wRatio = bdiv(Wo, Wi);
        uint diff   = bsub(Bo, Ao);
        uint y      = bdiv(Bo, diff);
        uint foo    = bpow(y, wRatio);
             foo    = bsub(foo, BONE);
             Ai     = bsub(BONE, fee);
             Ai     = bdiv(bmul(Bi, foo), Ai);
        return Ai;
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

    function calc_InGivenPrice( uint Bi, uint Wi
                              , uint Bo , uint Wo
                              , uint SER1
                              , uint fee)
      public pure
        returns ( uint Ai )
    {
        uint SER0    = calc_SpotPrice(Bi, Wi, Bo, Wo);
        uint base    = bdiv(SER0, SER1);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        Ai           = bsub(bpow(base, exp), BONE);
        Ai           = bmul(Ai, Bi);
        uint foo     = bsub(BONE, fee);
        Ai           = bdiv(Ai, foo);
        return Ai;
    }

    // Uses an approximation formula to compute b^(e.w)
    // by splitting it into (b^e)*(b^0.w).
    function bpow(uint base, uint exp)
      public pure
        returns (uint)
    {
        require(base <= BONE * 2, ERR_BPOW_BASE);
        uint whole                 = bfloor(exp);   
        uint remain                = bsub(exp, whole);

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
