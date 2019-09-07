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

import 'erc20/erc20.sol';
import 'ds-token/token.sol';

import "./BToken.sol";
import "./BBase.sol";

import "./BHub.sol";

contract BVault is BBronze
                 , BBase
                 , BTokenBase
{
    BHub  public hub;
    ERC20 public inner;

    constructor(address token) public {
        hub = BHub(msg.sender);
        inner = ERC20(token);
    }

    function wrap(uint256 amt) public {
        bool xfer = inner.transferFrom(msg.sender, address(this), amt);
        require(xfer, ERR_ERC20_FALSE);
        _mint(amt);
        _push(msg.sender, amt);
    }

    function unwrap(uint256 amt) public returns (uint256 out) {
        uint fee = bmul(UNWRAP_FEE, amt);
        out = amt - fee;
        _pull(msg.sender, amt);
        _push(address(hub), fee);
        _burn(out);
        bool xfer = inner.transfer(msg.sender, out);
        require(xfer, ERR_ERC20_FALSE);
    }

    function forceWrap(address whom, uint256 amt) public {
        require(hub.isBPool(msg.sender) || msg.sender == address(hub));
        bool xfer = inner.transferFrom(whom, address(this), amt);
        require(xfer, ERR_ERC20_FALSE);
        _mint(amt);
        _push(whom, amt);
    }

    function forceUnwrap(address whom, uint256 amt) public {
        require(hub.isBPool(msg.sender) || msg.sender == address(hub));
        _pull(whom, amt);
        _burn(amt);
        bool xfer = inner.transfer(whom, amt);
        require(xfer, ERR_ERC20_FALSE);
    }

    function transferFrom(address src, address dst, uint wad) public returns (bool) {
        if( hub.isBPool(msg.sender) ) {
            _move(src, dst, wad);
            return true;
        } else {
            return super.transferFrom(src, dst, wad);
        }
    }
}
