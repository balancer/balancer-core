pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';

import "./BalanceMath.sol";

contract Balancer is BalanceMath {
    address manager;
    uint256 feeRatio;

    ERC20 tokA;
    uint256 weightA;
    uint256 balanceA;

    ERC20 tokB;
    uint256 weightB;
    uint256 balanceB;

    constructor() public {
        manager = msg.sender;
    }

    function swapSpecifyIn(uint256 amountIn, ERC20 i, ERC20 o)
        public returns (uint256 amountOut, uint256 feeAmount)
    {
        ERC20 tin; ERC20 tout;
        uint256 tinWeight; uint256 tinBalance;
        uint256 toutWeight; uint256 toutBalance;

        if (i == tokA && o == tokB) {
            tin = tokA; tout = tokB;
            tinWeight = weightA; toutWeight = weightB;
            tinBalance = balanceA; toutBalance = balanceB;
        } else if (i == tokB && o == tokA) {
            revert();
        } else {
            revert();
        }

        (amountOut, feeAmount) = swapSpecifyInMath( tinBalance, tinWeight
                                                  , toutBalance, toutWeight
                                                  , amountIn, feeRatio );
        i.transferFrom(msg.sender, address(this), amountIn);
        o.transfer(msg.sender, amountOut);
        return (amountOut, feeAmount);
    }
}
