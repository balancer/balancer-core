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
        uint256 ratio = bDiv(Wi, Wo);
        uint256 y = bDiv(Bi, bAdd(Bi, Ai));

        revert("unimplemented");
    }

    function swapOmath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ao
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 Ai )
    {
        revert("unimplemented");
    }

    function spotPrice( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo )
        public pure
        returns ( uint256 r ) 
    {
        uint256 numer = bDiv(Bo, Wo);
        uint256 denom = bDiv(Bi, Wi);
        r = bDiv(numer, denom);
        return r;
    }

    // Expose DSMath as public / use wad terms
    function u256cast(int256 i) public pure returns (uint256 u) {
        return uint256(i);
    }
    function i256cast(uint256 u) public pure returns (int256 i) {
        // assert not too large
        require(u < 2**127);
        return int256(u);
    }
    function bOne() public pure returns (uint256) {
        return WAD;
    }
    function bAdd(uint256 a, uint256 b) public pure returns (uint256) {
        return add(a, b);
    }
    function bSub(uint256 a, uint256 b) public pure returns (uint256) {
        return sub(a, b);
    }
    function bMul(uint256 a, uint256 b) public pure returns (uint256) {
        return wmul(a, b);
    }
    function bDiv(uint256 a, uint256 b) public pure returns (uint256) {
        return wdiv(a, b);
    }
    function bPow(uint256 a, uint256 n) public pure returns (uint256) {
        revert("unimplemented");
        // https://github.com/dapphub/ds-math/blob/master/src/math.sol#L58
        // see rpow for exponention by squaring inspiration
        // but need wpow
        // return wpow(a, b);
    }
}
