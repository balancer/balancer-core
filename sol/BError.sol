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

// `pure internal` operating on constants should get fully optimized by compiler
// in other cases, should be used as a library

contract BError
{
    byte constant public ERR_NONE               = 0x00;

    byte constant public ERR_MATH_ADD_OVERFLOW  = 0x10;
    byte constant public ERR_MATH_SUB_UNDERFLOW = 0x11;
    byte constant public ERR_MATH_MUL_OVERFLOW  = 0x12;
    byte constant public ERR_MATH_DIV_ZERO      = 0x13;
    byte constant public ERR_MATH_DIV_INTERFLOW = 0x14; // intermdiate values overflow (we keep precision)

    byte constant public ERR_MAX_TOKENS         = 0x20;
    byte constant public ERR_MIN_WEIGHT         = 0x20;
    byte constant public ERR_MAX_WEIGHT         = 0x21;
    byte constant public ERR_MAX_TOTAL_WEIGHT   = 0x21;
    byte constant public ERR_MAX_FEE            = 0x22;
    byte constant public ERR_MIN_BALANCE        = 0x23;
    byte constant public ERR_MAX_BALANCE        = 0x24;
    byte constant public ERR_MAX_TRADE          = 0x25;

    // TODO: 3 limpublic it types (in, out, price)
    byte constant public ERR_LIMIT_FAILED       = 0x30;

    byte constant public ERR_OUT_OF_RANGE       = 0x40;

    byte constant public ERR_NOT_BOUND          = 0xe1;
    byte constant public ERR_ALREADY_BOUND      = 0xe2;

    byte constant public ERR_PAUSED             = 0xd0;
    byte constant public ERR_UNJOINABLE         = 0xd1;
    byte constant public ERR_BAD_CALLER         = 0xd2;

    byte constant public ERR_ERC20_FALSE        = 0xe0;
    
    byte constant public ERR_UNREACHABLE        = 0xff;

    function errs(byte berr)
      public pure
        returns (string memory)
    {
        if( berr == ERR_NONE )
            return "ERR_NONE";
        if( berr == ERR_PAUSED )
            return "ERR_PAUSED";
        if( berr == ERR_NOT_BOUND )
            return "ERR_NOT_BOUND";
        if( berr == ERR_BAD_CALLER )
            return "ERR_BAD_CALLER";
        if( berr == ERR_MIN_WEIGHT )
            return "ERR_MIN_WEIGHT";
        if( berr == ERR_ERC20_FALSE )
            return "ERR_ERC20_FALSE";
        if( berr == ERR_MATH_ADD_OVERFLOW )
            return "ERR_MATH_ADD_OVERFLOW";
        if( berr == ERR_MATH_SUB_UNDERFLOW )
            return "ERR_MATH_SUB_UNDERFLOW";
        if( berr == ERR_MATH_MUL_OVERFLOW )
            return "ERR_MATH_MUL_OVERFLOW";
        if( berr == ERR_MATH_DIV_ZERO )
            return "ERR_MATH_DIV_ZERO";
        if( berr == ERR_MATH_DIV_INTERFLOW )
            return "ERR_MATH_DIV_INTERFLOW";
        if( berr == ERR_MIN_WEIGHT )
            return "ERR_MIN_WEIGHT";
        if( berr == ERR_MAX_WEIGHT )
            return "ERR_MAX_WEIGHT";
        if( berr == ERR_MAX_TOTAL_WEIGHT )
            return "ERR_MAX_TOTAL_WEIGHT";
        if( berr == ERR_LIMIT_FAILED )
            return "ERR_LIMIT_FAILED";
        if( berr == ERR_UNJOINABLE )
            return "ERR_UNJOINABLE";
        revert("ERR_PANIC_UNKNOWN");
    }

    function check(byte berr)
      pure internal {
        check(berr == ERR_NONE, berr);
    } 

    function check(bool cond, byte berr)
      pure internal {
        if(!cond) {
            revert(errs(berr));
        }
    }

}
