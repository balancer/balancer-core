pragma solidity ^0.5.10;

// Study this
// https://github.com/dapphub/ds-math/blob/master/src/math.sol
import "ds-math/math.sol";
import "erc20/erc20.sol";

// Keep all functions public for now.
contract BalanceMath is DSMath {
    function swapSpecifyInMath(
        uint256 tinBalance, uint256 tinWeight
      , uint256 toutBalance, uint256 toutWeight
      , uint256 tinAmount
      , uint256 feeRatio
    )
        public pure
        returns ( uint256 toutAmount, uint256 feeAmount )
    {
        return (0, 0);
    }

    function ratio( uint256 tinWeight, uint256 tinBalance
                  , uint256 toutWeight, uint256 toutBalance )
        public pure
        returns ( uint256 r ) 
    {
        return 0;
    }
}
