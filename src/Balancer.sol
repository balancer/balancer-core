pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';

import "./BalanceMath.sol";

contract Balancer is BalanceMath {
    uint256 constant public MAX_TOKENS = 8;

    struct Record {
        bool    live;
        address token;
        uint256 weight;  // RAY
        uint256 balance; // WAD
    }
    address                   public manager;
    uint256                   public feeRatio; // RAY
    Record[]                  public tokens;
    mapping(address=>uint256) public index;

    constructor() public {
        manager = msg.sender;
    }

    function swapSpecifyIn(uint256 amountIn, address tin, address tout)
        public returns (uint256 amountOut, uint256 feeAmount)
    {
        require(isBound(tin));
        require(isBound(tout));
        uint256 tinWeight; uint256 tinBalance;
        uint256 toutWeight; uint256 toutBalance;

        (amountOut, feeAmount) = swapSpecifyInMath( tinBalance, tinWeight
                                                  , toutBalance, toutWeight
                                                  , amountIn, feeRatio );

        ERC20(tin).transferFrom(msg.sender, address(this), amountIn);
        ERC20(tout).transfer(msg.sender, amountOut);
        return (amountOut, feeAmount);
    }

    function isBound(address token) public view returns (bool) {
        return tokens[index[token]].token == token;
    }

    function bind(address token) public {
        require( ! isBound(token));
        uint256 len = tokens.push(Record({
            live: false, token: token, weight: 0, balance: 0
        }));
        index[token] == len;
    }
}
