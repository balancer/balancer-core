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

pragma solidity 0.5.12;

import "./BColor.sol";

contract BConst is BBronze {
    uint256 public constant BONE              = 10**18;

    uint256 public constant MAX_BOUND_TOKENS  = 8;
    uint256 public constant BPOW_PRECISION    = BONE / 10**10;

// TODO check carefully inclusive vs exlusive ranges

    uint256 public constant MAX_FEE           = BONE / 10;
    uint256 public constant EXIT_FEE           = BONE / 10000;

    uint256 public constant MIN_WEIGHT        = BONE;
    uint256 public constant MAX_WEIGHT        = BONE * 50;
    uint256 public constant MAX_TOTAL_WEIGHT  = BONE * 50;
    uint256 public constant MIN_BALANCE       = BONE / 10**6;
    uint256 public constant MAX_BALANCE       = BONE * 10**12;

    uint256 public constant MIN_POOL_SUPPLY   = BONE;

    uint public constant MIN_BPOW_BASE        = 1 wei;
    uint public constant MAX_BPOW_BASE        = (2 * BONE) - 1 wei;

    uint256 public constant MAX_IN_RATIO      = BONE / 2;
    uint256 public constant MAX_OUT_RATIO     = (BONE / 3) + 1 wei;

    string public constant ERR_ADD_OVERFLOW       = "ERR_ADD_OVERFLOW";
    string public constant ERR_SUB_UNDERFLOW      = "ERR_SUB_UNDERFLOW";
    string public constant ERR_MUL_OVERFLOW       = "ERR_MUL_OVERFLOW";
    string public constant ERR_DIV_ZERO           = "ERR_DIV_ZERO";
    string public constant ERR_DIV_INTERNAL       = "ERR_DIV_INTERNAL";
    string public constant ERR_BPOW_BASE_TOO_HIGH = "ERR_BPOW_BASE_TOO_HIGH";
    string public constant ERR_BPOW_BASE_TOO_LOW  = "ERR_BPOW_BASE_TOO_LOW";

    string public constant ERR_MAX_TOKENS         = "ERR_MAX_TOKENS";
    string public constant ERR_MAX_FEE            = "ERR_MAX_FEE";
    string public constant ERR_MIN_WEIGHT         = "ERR_MIN_WEIGHT";
    string public constant ERR_MAX_WEIGHT         = "ERR_MAX_WEIGHT";
    string public constant ERR_MIN_BALANCE        = "ERR_MIN_BALANCE";
    string public constant ERR_MAX_BALANCE        = "ERR_MAX_BALANCE";
    string public constant ERR_MAX_TOTAL_WEIGHT   = "ERR_MAX_TOTAL_WEIGHT";
    string public constant ERR_MIN_POOL_SUPPLY    = "ERR_MIN_POOL_SUPPLY";

    string public constant ERR_IS_BOUND           = "ERR_IS_BOUND";
    string public constant ERR_NOT_BOUND          = "ERR_NOT_BOUND";

    string public constant ERR_IS_FINALIZED       = "ERR_IS_FINALIZED";
    string public constant ERR_NOT_FINALIZED      = "ERR_NOT_FINALIZED";

    string public constant ERR_NOT_CONTROLLER     = "ERR_NOT_CONTROLLER";
    string public constant ERR_NOT_FACTORY        = "ERR_NOT_FACTORY";

    string public constant ERR_SWAP_NOT_PUBLIC    = "ERR_SWAP_NOT_PUBLIC"; // trying to swap

    string public constant ERR_REENTRY            = "ERR_REENTRY";
    string public constant ERR_ERC20_FALSE        = "ERR_ERC20_FALSE";

    string public constant ERR_MAX_IN_RATIO       = "ERR_MAX_IN_RATIO";
    string public constant ERR_MAX_OUT_RATIO      = "ERR_MAX_OUT_RATIO";

    string public constant ERR_LIMIT_IN           = "ERR_LIMIT_IN";
    string public constant ERR_LIMIT_OUT          = "ERR_LIMIT_OUT";
    string public constant ERR_LIMIT_PRICE        = "ERR_LIMIT_PRICE";

    string public constant ERR_BAD_LIMIT_PRICE    = "ERR_BAD_LIMIT_PRICE";

    string public constant ERR_MATH_APPROX        = "ERR_MATH_APPROX";
}
