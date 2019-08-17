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
        uint256 wRatio               = bdiv(Wi, Wo);

        // adjustedIn = Ai * (1 - fee)
        uint256 adjustedIn;
        (adjustedIn, flag)           = bsubSign(BONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                   = bmul(Ai, adjustedIn);

        // y = Bi / (Bi + Ai * (1 - fee))
        uint256 y                    = bdiv(Bi, badd(Bi, adjustedIn));
        uint256 foo                  = bpow(y, wRatio);
        uint256 bar;
        (bar, flag)                  = bsubSign(BONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                                  = bmul(Bo, bar);
	}

    // @calc_InGivenOut
    //      do swap math on output
    //      return input amount from corresponding output amount
    //      Ai = ((Bi/(Bi + Ai))^(Wo/Wi) - 1) * Bo / (1 - fee)
    function calc_InGivenOut( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ao
                      , uint256 fee
                      )
        public pure
        returns ( uint Ai )
    {
        bool flag;
        uint256 wRatio     = bdiv(Wo, Wi);

        // y = Bo / (Bo - Ao)
        uint256 diff;
        (diff, flag)       = bsubSign(Bo, Ao);
        require( !flag, "BMath.calc_InGivenOut");
        uint256 y          = bdiv(Bo, diff);

        uint256 foo        = bpow(y, wRatio);
        (foo,flag)         = bsubSign(foo, BONE);
        require( !flag, "BMath.calc_InGivenOut");

        // adjust Ai for fee
        (Ai,flag)          = bsubSign(BONE, fee);
        require( !flag, "BMath.calc_InGivenOut");
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

    // @amountUpToPriceApprox
    //      returns how much TokenIn is needed to lower
    //      the exchange rate to SER1
    function amountUpToPriceApprox( uint256 Bi
                                  , uint256 Wi
                                  , uint256 Bo
                                  , uint256 Wo
                                  , uint256 SER1
                                  , uint256 fee)
        public pure
        returns ( uint Ai )
    {
        require( Bi > 0);
        require( Wi > 0);
        require( Bo > 0);
        require( Wo > 0);
        bool flag;
        uint256 SER0 = spotPrice(Bi, Wi, Bo, Wo);
        require( SER1 <= SER0);
        uint256 base = bdiv(SER0, SER1);
        uint256 exp  = bdiv(Wo, badd(Wo, Wi));
        (Ai,flag)    = bsubSign(bpow(base, exp), BONE);
        require( !flag, "BMath.amountUpToPriceApprox");
        Ai        = bmul(Ai, Bi);
        Ai        = bdiv(Ai, bsub(BONE, fee)); // TODO bsubSign, require etc
    }

    // @bpow
    // @params:
    //      base - WAD
    //      exp  - WAD
    // splits b^e.w into b^e*b^0.w
    function bpow(uint base, uint exp) public pure returns (uint)
    {
        uint whole                 = bfloor(exp);   
        (uint remain, bool flag)   = bsubSign(exp, whole);
        require( !flag, "BMath.bpow");
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


    // wad floor
    function wfloor(uint x) internal pure returns (uint z) {
        z = x / BONE * BONE;
    }

    // wad sub
    // return result and overflow flag
    function wsub(uint256 a, uint256 b) public pure returns (uint256, bool) {
        if (a >= b) {
            return (bsub(a, b), false);
        } else {
            return (bsub(b, a), true);
        }
    }

    // wad add
    function wadd(uint256 a, uint256 b) public pure returns (uint256) {
        return badd(a, b);
    }

    // @wpown
    // @params
    //      x - WAD, base
    //      n - int, exp
    function wpown(uint x, uint n) internal pure returns (uint z) {
        z = n % 2 != 0 ? x : BONE;

        for (n /= 2; n != 0; n /= 2) {
            x = bmul(x, x);

            if (n % 2 != 0) {
                z = bmul(z, x);
            }
        }
    }

    // @wtoi
    // @params
    //      @w - WAD
    // convert wad to int
    function wtoi(uint w) internal pure returns (uint) {
        return w / BONE;
    }

}
