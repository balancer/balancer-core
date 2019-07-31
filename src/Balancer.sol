pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BalanceMath.sol";

contract Balancer is BalanceMath {
    address                   public manager;
    uint256                   public feeRatio; // RAY
    uint256                   public unclaimedFees;

    uint256 constant public   MAX_TOKENS = 8;
    uint256                   numTokens;
    mapping(address=>Record)  public records;

    struct Record {
        bool    bound;
        ERC20   addr;
        uint256 weight;  // RAY
        uint256 balance; // WAD
    }

    constructor() public {
        manager = msg.sender;
    }

    function swapI(uint256 amountIn, ERC20 tin, ERC20 tout)
        public returns (uint256 amountOut, uint256 feeAmount)
    {
        require(isBound(tin));
        require(isBound(tout));

        Record storage I = records[address(tin)];
        Record storage O = records[address(tout)];

        (amountOut, feeAmount) = swapImath( I.balance, I.weight
                                          , O.balance, O.weight
                                          , amountIn, feeRatio );

        ERC20(tin).transferFrom(msg.sender, address(this), amountIn);
        ERC20(tout).transfer(msg.sender, amountOut);
        unclaimedFees += feeAmount;
        return (amountOut, feeAmount);
    }

    function isBound(ERC20 token) public view returns (bool) {
        return records[address(token)].bound;
    }

    function bind(ERC20 token) public {
        require(msg.sender == manager);
        require( ! isBound(token));
        require( numTokens < MAX_TOKENS );
        records[address(token)] = Record({
            addr: token
          , bound: true
          , weight: 0
          , balance: 0
        });
        numTokens++;
    }
    function unbind(ERC20 token) public {
        require(msg.sender == manager);
        require(isBound(token));
        delete records[address(token)];
        numTokens--;
    }
}
