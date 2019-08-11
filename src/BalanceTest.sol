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

    Balancer public b;
    DSToken public A;
    DSToken public B;
    DSToken public C;

    constructor() public {
        b = new Balancer();
        A = new DSToken("A");
        B = new DSToken("B");
        C = new DSToken("C");
        b.bind(A);
        b.bind(B);
        b.bind(C);
        A.approve(address(b), uint256(-1));
        B.approve(address(b), uint256(-1));
        C.approve(address(b), uint256(-1));
        A.mint(200 ether); B.mint(200 ether); C.mint(200 ether);
    }

    function run() public returns (address) {
        want(true, "want(true)");
        want(A.balanceOf(address(this)) == 200 ether, "wrong A balance");

        b.setParams(A, 1 ether, 100 ether);
        b.setParams(B, 1 ether, 100 ether);
        b.setParams(C, 1 ether, 100 ether);
        b.start();

        uint256 outAmt;
        uint256 feeAmt;
        outAmt = b.swapI(1 ether, A, B);
    }
}
