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

import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BBronze.sol";

contract BToken is DSToken
                 , BBronze
{
    ERC20 public inner;

    constructor(bytes32 symbol_, ERC20 inner_)
      public
        DSToken(symbol_)
    {
        inner = inner_;
    }

    function transferFrom(address src, address dst, uint256 amt)
      public
        returns (bool)
    {
        if (_balances[src] < amt) {
            uint256 diff = amt - _balances[src];
            inner.transferFrom(src, address(this), diff);
        }
        return super.transferFrom(src, dst, amt);
    }
}
