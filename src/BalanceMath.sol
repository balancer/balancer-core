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
        returns ( uint256 OAmount, uint256 feeAmount )
    {
        throw;
        OAmount = wmul( IAmount
                         , ratio( IWeight, IBalance
                                , OWeight, OBalance));
        feeAmount = wmul(feeRatio, IAmount);
        return (OAmount, feeAmount);
    }

    function ratio( uint256 IBalance, uint256 IWeight
                  , uint256 OBalance, uint256 OWeight )
        public pure
        returns ( uint256 r ) 
    {
        // suppress warnings
            IWeight = IWeight;
            IBalance = IBalance;
            OWeight = OWeight;
            OBalance = OBalance;
        return 0;
    }


    // Expose DSMath as public / use wad terms
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
        throw;
        // see rpow for exponention by squaring inspiration
        // but need wpow
        // return rpow(a, b);
    }
}
