pragma solidity ^0.5.10;

import "ds-math/math.sol";
import "./Balancer.sol";

contract BalanceTest is BalanceMath {
    event Fail(string reason);
    function want(bool cond, string memory r) public {
        if (!cond) {
            emit Fail(r);
        }
    }

    Balancer public bal;
    DSToken public A;
    DSToken public B;
    DSToken public C;

    constructor() public {
        A = new DSToken("A");
        B = new DSToken("B");
        C = new DSToken("C");
        A.mint(100 ether);
        B.mint(100 ether);
        C.mint(100 ether);
    }

    function run() public returns (address) {
        want(true, "Test false return value");
        return address(bal);
    }
}
