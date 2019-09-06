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

import "./BError.sol";

contract BIHub {
    function isPool(address p) public returns (bool);
}
contract BVault is BError
                 , DSToken
{
    BIHub                  public hub;
    ERC20                  public inner;
    address                public blabs;
    uint256                public unwrapFee;
    mapping(address=>uint) public poolBalances;

    // User
    function wrap(uint256 amt) public;
    function unwrap(uint256 amt) public;

    function forceWrap(address whom, uint256 amt) public {
        require(hub.isPool(msg.sender));
    }
    function forceUnwrap(address whom, uint256 amt) public {
        require(hub.isPool(msg.sender));
    }

    function move(address src, address dst, uint256 amt) public {
    }

}
