pragma solidity ^0.5.10;

// Keep all functions public for now.
contract BalanceMath {

    // Abstract away third party libraries (safe math, fixed point)
    function add(uint256 a, uint256 b) public returns (uint256 c) {
        return a+b;
    }    
}
