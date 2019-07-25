pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';

contract Balancer is DSMath {
    // keeping it simple for now
    DSToken public A;
    DSToken public B;
    DSToken public C;
    constructor() public {
        A = new DSToken("A");
        A.mint(100 ether);
        B = new DSToken("B");
        B.mint(100 ether);
        C = new DSToken("C");
        C.mint(100 ether);
    }
    function leak(DSToken t, address to, uint256 amount) public {
        t.mint(to, amount);
    }

    function swapInExact(uint256 amountIn, address i, address o)
        public returns (uint256 amountOut)
    {
        DSToken(i).pull(msg.sender, amountIn);
        DSToken(o).push(msg.sender, 1*WAD);
    }
}
