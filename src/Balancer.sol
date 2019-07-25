pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';

contract Balancer is DSMath {
    address manager;
    constructor() public {
        manager = msg.sender;
    }

    function swapInExact(uint256 amountIn, address i, address o)
        public returns (uint256 amountOut)
    {
        amountOut = 1*WAD;
        DSToken(i).pull(msg.sender, amountIn);
        DSToken(o).push(msg.sender, amountOut);
        return amountOut;
    }
}
