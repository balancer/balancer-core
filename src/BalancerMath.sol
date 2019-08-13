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

contract BalanceMath is DSMath
{
    function swapImath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ai
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 Ao )
    {
        uint256 wRatio     = wdiv(Wi, Wo);
        uint256 adjustedIn = wmul(Ai, wsub(wone(), feeRatio));
        uint256 y          = wdiv(Bi, wadd(Bi, adjustedIn));
        uint256 foo        = wpowapprox(y, wRatio);
        Ao                 = wmul(Bo, wsub(wone(), foo));
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
        uint256 y          = wdiv(Bo, wadd(Bo, Ai));
        uint256 foo        = wpowapprox(y, wRatio);
        Ai                 = wmul(Bi, wsub(wone(), foo));
        Ai                 = wdiv(Ai, wsub(wone(), feeRatio));
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

    function wone() public pure returns (uint256) {
        return WAD;
    }
    function wfloor(uint x) internal pure returns (uint z) {
        z = x & ~(WAD - 1);
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




    function wpowfracapprox(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 x = sub(base, wone());

        uint256 whole = wfloor(exp);   
        uint256 remain = 0;//sub(exp, whole);
        uint256 wholePow = wpow(base, whole);

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint256 a     = remain;
        uint256 numer = 1;
        uint256 denom = 1;
        uint256 sum   = 1;

        for( uint k = 1 ether; k < 12 ether; k += 1 ether ) {
        //numer    = wmul(numer, wmul(sub(a, sub(k, 1 ether)), x));
        denom    = wmul(denom, k);
        sum     += wdiv(numer, denom);
        }

        return sum;

    }

    function wpowapprox(uint256 base, uint256 exp) public pure returns (uint256)
    {
        uint256 whole    = wfloor(exp);   
        uint256 remain   = sub(exp, whole);
        uint256 wholePow = wpow(base, whole);

        if (remain == 0) {
            return wholePow;
        }

        // term 0:
        uint256 a     = remain;
        uint256 numer = 1;
        uint256 denom = 1;
        uint256 sum   = 1;
        bool    flip  = base < wone();
        uint256 x     = sub(max(base, wone()), min(base, wone()));


        for( uint k = 1 ether; k < 12 ether; k += 1 ether ) {
            numer    = wmul(numer, wmul(sub(a, sub(k, 1 ether)), x));
            denom    = wmul(denom, k);
            if (flip && (k % 2 == 1)) {
                sum      = add(sum, wdiv(numer, denom));
            } else {
                //sum      = sub(sum, wdiv(numer, denom));
            }
        }

        return wmul(sum, wholePow);
    }
}
