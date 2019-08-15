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
    byte constant ERR_NONE          = 0x00;

    byte constant ERR_PAUSED        = 0x10;
    byte constant ERR_BAD_CALLER    = 0x11;

    byte constant ERR_MAX_TOKENS    = 0x20;
    byte constant ERR_NOT_BOUND     = 0x21;
    byte constant ERR_ALREADY_BOUND = 0x22;

    byte constant ERR_MIN_WEIGHT    = 0x30;
    byte constant ERR_MAX_WEIGHT    = 0x31;
    byte constant ERR_MAX_FEE       = 0x32;

    byte constant ERR_ERC20_FALSE   = 0xe0;
    
    byte constant ERR_UNREACHABLE   = 0xff;

    function serr(byte berr)
        pure internal
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
        revert("ERR_PANIC_UNKNOWN");
    }
  
    function check(byte berr)
        pure internal {
        check(berr == ERR_NONE, berr);
    } 
    function check(bool cond, byte berr)
        pure internal {
        if(!cond)
            revert(serr(berr));
    }
}
