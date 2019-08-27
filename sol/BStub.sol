pragma solidity ^0.5.10;

import "./BError.sol";
import "./BConst.sol";
contract BStub is BError, BConst {
    byte constant public TEST_ERR_NONE = ERR_NONE;

    byte constant public TEST_ERR_MATH_ADD_OVERFLOW  = ERR_MATH_ADD_OVERFLOW;
    byte constant public TEST_ERR_MATH_SUB_UNDERFLOW = ERR_MATH_SUB_UNDERFLOW;
    byte constant public TEST_ERR_MATH_MUL_OVERFLOW  = ERR_MATH_MUL_OVERFLOW;
    byte constant public TEST_ERR_MATH_DIV_ZERO      = ERR_MATH_DIV_ZERO;
    byte constant public TEST_ERR_MATH_DIV_INTERFLOW = ERR_MATH_DIV_INTERFLOW;

    byte constant public TEST_ERR_MAX_TOKENS       = ERR_MAX_TOKENS;
    byte constant public TEST_ERR_MIN_WEIGHT       = ERR_MIN_WEIGHT;
    byte constant public TEST_ERR_MAX_WEIGHT       = ERR_MAX_WEIGHT;
    byte constant public TEST_ERR_MAX_TOTAL_WEIGHT = ERR_MAX_TOTAL_WEIGHT;
    byte constant public TEST_ERR_MAX_FEE          = ERR_MAX_FEE;
    byte constant public TEST_ERR_MIN_BALANCE      = ERR_MIN_BALANCE;
    byte constant public TEST_ERR_MAX_BALANCE      = ERR_MAX_BALANCE;
    byte constant public TEST_ERR_MAX_TRADE        = ERR_MAX_TRADE;

    // TODO: 3 limit types (in, out, price)
    byte constant public TEST_ERR_LIMIT_FAILED = ERR_LIMIT_FAILED;


    byte constant public TEST_ERR_NOT_BOUND     = ERR_NOT_BOUND;
    byte constant public TEST_ERR_ALREADY_BOUND = ERR_ALREADY_BOUND;

    byte constant public TEST_ERR_PAUSED     = ERR_PAUSED;
    byte constant public TEST_ERR_UNJOINABLE = ERR_UNJOINABLE;
    byte constant public TEST_ERR_BAD_CALLER = ERR_BAD_CALLER;

    byte constant public TEST_ERR_ERC20_FALSE = ERR_ERC20_FALSE;
    
    byte constant public TEST_ERR_UNREACHABLE = ERR_UNREACHABLE;

    uint8   constant public TEST_MAX_BOUND_TOKENS      = MAX_BOUND_TOKENS;
    uint256 constant public TEST_BONE                  = BONE;
    uint256 constant public TEST_MAX_FEE               = MAX_FEE;
    uint256 constant public TEST_MIN_TOKEN_WEIGHT      = MIN_TOKEN_WEIGHT;
    uint256 constant public TEST_MAX_TOKEN_WEIGHT      = MAX_TOKEN_WEIGHT;
    uint256 constant public TEST_MAX_TOTAL_WEIGHT      = MAX_TOTAL_WEIGHT;
    uint256 constant public TEST_MIN_TOKEN_BALANCE     = MIN_TOKEN_BALANCE;
    uint256 constant public TEST_MAX_TOKEN_BALANCE     = MAX_TOKEN_BALANCE;
    uint256 constant public TEST_MAX_TRADE_FRAC        = MAX_TRADE_FRAC;
}
