// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.5.10;

contract BConst
{
    uint8   constant MAX_BOUND_TOKENS  = 8;
    uint256 constant BONE              = 10**18;
    uint256 constant MIN_FEE           = BONE / 10000;
    uint256 constant MAX_FEE           = BONE / 10;
    uint256 constant UNWRAP_FEE        = BONE / 1000;
    uint256 constant MIN_WEIGHT        = BONE;
    uint256 constant MAX_WEIGHT        = BONE * 100;
    uint256 constant MAX_TOTAL_WEIGHT  = BONE * 100;
    uint256 constant MIN_BALANCE       = BONE / 10**6;
    uint256 constant MAX_BALANCE       = BONE * 10**12;
    uint256 constant MIN_POOL_SUPPLY   = BONE;

    uint256 constant MAX_TRADE_IN      = BONE * 9;
    uint256 constant MAX_TRADE_OUT     = BONE / 2;
    uint256 constant MIN_SLIP_PRICE    = BONE * 55 / 100;


    string constant ERR_NONE               = "";

    string constant ERR_MATH_ADD_OVERFLOW  = "ERR_MATH_ADD_OVERFLOW";
    string constant ERR_MATH_SUB_UNDERFLOW = "ERR_MATH_SUB_UNDERFLOW";
    string constant ERR_MATH_MUL_OVERFLOW  = "ERR_MATH_MUL_OVERFLOW";
    string constant ERR_MATH_DIV_ZERO      = "ERR_MATH_DIV_ZERO";
    string constant ERR_MATH_DIV_INTERNAL  = "ERR_MATH_DIV_INTERNAL";

    string constant ERR_CALC_PANIC         = "ERR_CALC_PANIC";
    string constant ERR_BPOW_BASE          = "ERR_BPOW_BASE";

    string constant ERR_MAX_TOKENS         = "ERR_MAX_TOKENS";
    string constant ERR_MAX_FEE            = "ERR_MAX_FEE";
    string constant ERR_MIN_WEIGHT         = "ERR_MIN_WEIGHT";
    string constant ERR_MAX_WEIGHT         = "ERR_MAX_WEIGHT";
    string constant ERR_MIN_BALANCE        = "ERR_MIN_BALANCE";
    string constant ERR_MAX_BALANCE        = "ERR_MAX_BALANCE";
    string constant ERR_MAX_TOTAL_WEIGHT   = "ERR_MAX_TOTAL_WEIGHT";
    string constant ERR_MIN_POOL_SUPPLY    = "ERR_MAX_BALANCE";

    string constant ERR_NOT_BOUND          = "ERR_NOT_BOUND";
    string constant ERR_ALREADY_BOUND      = "ERR_ALREADY_BOUND";

    string constant ERR_PAUSED             = "ERR_PAUSED";
    string constant ERR_UNJOINABLE         = "ERR_UNJOINABLE";
    string constant ERR_BAD_CALLER         = "ERR_BAD_CALLER";

    string constant ERR_REENTRY            = "ERR_REENTRY";
    string constant ERR_ERC20_FALSE        = "ERR_ERC20_FALSE";
    
    string constant ERR_UNREACHABLE        = "ERR_UNREACHABLE";

// bad error names
    string constant ERR_MAX_TRADE          = "ERR_MAX_TRADE";
    string constant ERR_LIMIT_FAILED       = "ERR___TODO_LIMIT";
    string constant ERR_LIMIT_IN           = "ERR_LIMIT_IN";
    string constant ERR_LIMIT_OUT          = "ERR_LIMIT_OUT";
    string constant ERR_LIMIT_PRICE        = "ERR_LIMIT_PRICE";
    string constant ERR_MAX_IN             = "ERR_MAX_IN";
    string constant ERR_OUT_OF_RANGE       = "ERR____TODO_RANGE";
// 


}
