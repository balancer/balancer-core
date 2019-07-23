pragma solidity ^0.5.10;

// Study this
// https://github.com/dapphub/ds-math/blob/master/src/math.sol
import "ds-math/math.sol";

// Keep all functions public for now.
contract BalanceMath is DSMath {
    function getAmountOut(uint256 Qi, uint256 Qj, uint256 wi, uint256 wj)
        public pure returns (uint256)
    {
        uint256 rayExample = rmul(wi, wj);
        uint256 wadExample = add(Qi, Qj);
        return add(Qi, Qj);
    }
}
