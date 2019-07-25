pragma solidity ^0.5.10;

import "ds-math/math.sol";
import "./Balancer.sol";

contract BalanceTest is DSMath {
    Balancer public bal;
    event Fail(string reason);
    function want(bool cond, string memory r) public {
        if (!cond) {
            emit Fail(r);
        }
    }
    function run() public returns (address) {
        want(false, "test");
        return address(bal);
    }
}
