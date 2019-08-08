pragma solidity ^0.5.10;

import "ds-math/math.sol";
import "erc20/erc20.sol";

contract BalanceMath is DSMath
{
   
    function swapImath( uint256 tinBalance, uint256 tinWeight
                      , uint256 toutBalance, uint256 toutWeight
                      , uint256 tinAmount
                      , uint256 feeRatio
                      )
        public pure
        returns ( uint256 toutAmount, uint256 feeAmount )
    {
        toutAmount = wmul( tinAmount
                         , ratio( tinWeight, tinBalance
                                , toutWeight, toutBalance));
        feeAmount = wmul(feeRatio, tinAmount);
        return (toutAmount, feeAmount);
    }

    function ratio( uint256 tinBalance, uint256 tinWeight
                  , uint256 toutBalance, uint256 toutWeight )
        public pure
        returns ( uint256 r ) 
    {
        // suppress warnings
            tinWeight = tinWeight;
            tinBalance = tinBalance;
            toutWeight = toutWeight;
            toutBalance = toutBalance;
        return WAD; //return wdiv(tinWeight, toutWeight);
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

}
