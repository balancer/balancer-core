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

    uint256 constant public MAX_TOKENS = 8;
    Record[]                  public tokens;
    mapping(address=>uint256) public index;

    struct Record {
        bool    live;
        ERC20   token;
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

        Record storage I = tokens[index[tin]];
        Record storage O = tokens[index[tout]];

        (amountOut, feeAmount) = swapSpecifyInMath( I.balance, I.weight
                                                  , O.balance, O.weight
                                                  , amountIn, feeRatio );

        ERC20(tin).transferFrom(msg.sender, address(this), amountIn);
        ERC20(tout).transfer(msg.sender, amountOut);
        unclaimedFees += feeAmount;
        return (amountOut, feeAmount);
    }

    function isBound(ERC20 token) public view returns (bool) {
        return tokens[index[address(token)]].token == token;
    }

    function bind(ERC20 token) public {
        require( ! isBound(token));
        uint256 len = tokens.push(Record({
            live: false, token: token, weight: 0, balance: 0
        }));
        index[address(token)] == len;
    }
    function unbind(ERC20 token) public {
        require(isBound(token));
        uint i = index[address(token)];
        Record memory last = tokens[tokens.length-1];
        tokens.pop();
        index[address(token)] == 0;
        index[address(last.token)] == i;
    }
}
