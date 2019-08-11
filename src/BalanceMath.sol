pragma solidity ^0.5.10;

import "ds-math/math.sol";
import "erc20/erc20.sol";

contract BalanceMath is DSMath
{
   
    function swapImath( uint256 IBalance, uint256 IWeight
                      , uint256 OBalance, uint256 OWeight
                      , uint256 IAmount
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 OAmount )
    {
        revert("unimplemented");
    }

    function spotPrice( uint256 IBalance, uint256 IWeight
                      , uint256 OBalance, uint256 OWeight )
        public pure
        returns ( uint256 r ) 
    {
        uint256 numer = bDiv(OBalance, OWeight);
        uint256 denom = bDiv(IBalance, IWeight);
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
        revert("unimplemented");
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
        // see rpow for exponention by squaring inspiration
        // but need wpow
        // return rpow(a, b);
    }
}
