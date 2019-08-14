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

contract BalancerMath is DSMath
{
    function swapImath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ai
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 Ao )
    {
        uint256 wRatio          = wdiv(Wi, Wo);
        (uint256 adjustedIn,)   = wsub(wone(), feeRatio);
        adjustedIn              = wmul(Ai, adjustedIn);
        uint256 y               = wdiv(Bi, wadd(Bi, adjustedIn));
        uint256 foo             = wpowapprox(y, wRatio);
        (Ao,)                   = wsub(wone(), foo);
        Ao                      = wmul(Bo, Ao);
	}

    function swapOmath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ao
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 Ai )
    {
        uint256 wRatio     = wdiv(Wo, Wi);
        (uint256 diff,)    = wsub(Bo, Ao);
        uint256 y          = wdiv(Bo, diff);
        uint256 foo        = wpowapprox(y, wRatio);
        (foo,)             = wsub(foo, wone());
        (Ai,)              = wsub(wone(), feeRatio);
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

    function spotPriceChangeMath(  uint256 Bi
                                 , uint256 Wi
                                 , uint256 Bo
                                 , uint256 Wo
                                 , uint256 SER1
                                 , uint256 fee)
        public pure
        returns ( uint256 Ai )
    {
        uint256 SER0 = spotPrice(Bi, Wi, Bo, Wo);
        uint256 base = wdiv(SER0, SER1);
        uint256 exp  = wdiv(Wo, add(Wo, Wi));
        Ai = sub(wpowapprox(base, exp), wone());
        Ai = wmul(Ai, Bi);
        Ai = wdiv(Ai, sub(wone(), fee));
    }

    function wone() public pure returns (uint256) {
        return WAD;
    }

    function wfloor(uint x) internal pure returns (uint z) {
        z = x / wone() * wone();
    }

    function wsub(uint256 a, uint256 b) public pure returns (uint256, bool) {
        if (a > b) {
            return (sub(a, b), false);
        } else {
            return (sub(b, a), true);
        }
    }

    function wadd(uint256 a, uint256 b) public pure returns (uint256) {
        return add(a, b);
    }




    function wpow(uint x, uint n) internal pure returns (uint z) {
        z = n % 2 != 0 ? x : WAD;

        for (n /= 2; n != 0; n /= 2) {
            x = wmul(x, x);

            if (n % 2 != 0) {
                z = wmul(z, x);
            }
        }
    }

    function wtoi(uint w) internal pure returns (uint) {
        return w / wone();
    }

    function wpowapprox(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 whole    = wfloor(exp);   
        uint256 remain   = sub(exp, whole);
        uint256 wholePow = wpow(base, wtoi(whole));

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint256 a     = remain;
        uint256 numer = wone();
        uint256 denom = wone();
        uint256 sum   = wone();
        (uint256 x, bool xneg)  = wsub(base, wone());


        uint select = 0;
        for( uint i = 1; i < 20; i++) {
            uint256 k = i * wone();
            
            (uint256 c, bool cneg) = wsub(a, sub(k, wone()));
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
