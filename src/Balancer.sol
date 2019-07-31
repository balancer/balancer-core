pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BalanceMath.sol";

contract Balancer is BalanceMath {
    bool                      public paused;
    address                   public manager;
    uint256                   public feeRatio;
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
        paused = true;
    }

    function swapI(uint256 amountIn, ERC20 tin, ERC20 tout)
        public returns (uint256 amountOut, uint256 feeAmount)
    {
        require( ! paused);
        require(isBound(tin), "tin not bound");
        require(isBound(tout), "tout not bound");
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

    function setParams(ERC20 token, uint256 weight, uint256 balance)
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        records[address(token)].weight = weight;
        uint256 oldBalance = records[address(token)].balance;
        records[address(token)].balance = balance;
        if (balance > oldBalance) {
            token.transferFrom(msg.sender, address(this), balance - oldBalance);
        } else {
            token.transfer(msg.sender, oldBalance - balance);
        }
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
    function pause() public {
        assert(msg.sender == manager);
        paused = true;
    }
    function start() public {
        assert(msg.sender == manager);
        paused = false;
    }
}
