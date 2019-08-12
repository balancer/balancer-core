pragma solidity ^0.5.10;

import "ds-math/math.sol";
import "erc20/erc20.sol";

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
 		uint256 adjustedIn = wmul(Ai, wsub(1, feeRatio));
        uint256 y          = wdiv(Bi, wadd(Bi, adjustedIn));
		Ao                 = wmul(Bo, wsub(1, wpowapprox(y, wRatio)));
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
        uint256 y          = wdiv(Bi, wadd(Bi, Ai));
		Ai                 = wmul(Bi, wsub(1, wpowapprox(y, wRatio)));
 		Ai                 = wdiv(Ai, wsub(1, feeRatio));
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

}
