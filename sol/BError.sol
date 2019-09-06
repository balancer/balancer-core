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

contract BError
{
    string constant public ERR_NONE               = "";

    function isError(string memory err) public returns (bool) {
        return bytes(err).length != 0;
    }

    string constant public ERR_MATH_ADD_OVERFLOW  = "ERR_MATH_ADD_OVERFLOW";
    string constant public ERR_MATH_SUB_UNDERFLOW = "ERR_MATH_SUB_UNDERFLOW";
    string constant public ERR_MATH_MUL_OVERFLOW  = "ERR_MATH_MUL_OVERFLOW";
    string constant public ERR_MATH_DIV_ZERO      = "ERR_MATH_DIV_ZERO";
    string constant public ERR_MATH_DIV_INTERNAL  = "ERR_MATH_DIV_INTERNAL";

    string constant public ERR_MAX_TOKENS         = "ERR_MAX_TOKENS";
    string constant public ERR_MIN_WEIGHT         = "ERR_MIN_WEIGHT";
    string constant public ERR_MAX_WEIGHT         = "ERR_MAX_WEIGHT";
    string constant public ERR_MAX_TOTAL_WEIGHT   = "ERR_MAX_TOTAL_WEIGHT";
    string constant public ERR_MAX_FEE            = "ERR_MAX_FEE";
    string constant public ERR_MIN_BALANCE        = "ERR_MIN_BALANCE";
    string constant public ERR_MAX_BALANCE        = "ERR_MAX_BALANCE";
    string constant public ERR_MAX_TRADE          = "ERR_MAX_TRADE";

    // TODO: 3 limpublic it types (in, out, price)
    string constant public ERR_LIMIT_FAILED       = "ERR___TODO_LIMIT";
    string constant public ERR_LIMIT_IN           = "ERR_LIMIT_IN";
    string constant public ERR_LIMIT_OUT          = "ERR_LIMIT_OUT";
    string constant public ERR_LIMIT_PRICE        = "ERR_LIMIT_PRICE";

    string constant public ERR_MAX_IN             = "ERR_MAX_IN";
    string constant public ERR_OUT_OF_RANGE       = "ERR____TODO_RANGE";

    string constant public ERR_NOT_BOUND          = "ERR_NOT_BOUND";
    string constant public ERR_ALREADY_BOUND      = "ERR_ALREADY_BOUND";

    string constant public ERR_PAUSED             = "ERR_PAUSED";
    string constant public ERR_UNJOINABLE         = "ERR_UNJOINABLE";
    string constant public ERR_BAD_CALLER         = "ERR_BAD_CALLER";

    string constant public ERR_ERC20_FALSE        = "ERR_ERC20_FALSE";
    string constant public ERR_ERC20_REENTRY      = "ERR_ERC20_REENTRY";
    
    string constant public ERR_UNREACHABLE        = "ERR_UNREACHABLE";
}
