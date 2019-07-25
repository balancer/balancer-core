pragma solidity ^0.5.10;

// Study this
// https://github.com/dapphub/ds-math/blob/master/src/math.sol
import "ds-math/math.sol";
import "erc20/erc20.sol";

// Keep all functions public for now.
contract BalanceMath is DSMath {
    function swapInExactMath(
        ERC20 tin, uint256 tinBalance, uint256 tinWeight
      , ERC20 tout, uint256 toutBalance, uint256 toutWeight
      , uint256 fee
    )
    public pure
    returns ( uint256 tinMoved, uint256 toutMoved, uint256 feeCollected
            , uint256 newTinWeight, uint256 newToutWeight );
}
