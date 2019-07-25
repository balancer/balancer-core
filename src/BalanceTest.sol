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
        /*
        bal = new Balancer();
        DSToken A = bal.A();
        DSToken B = bal.B();
        DSToken C = bal.C();
        bal.leak(A, address(this), 1*WAD);
        want(A.balanceOf(address(this)) == 1*WAD, "wrong amount");
        */
        want(false, "test");
        return address(bal);
    }
}
