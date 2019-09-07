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
import "./BError.sol";
import "./BConst.sol";
import "./BNum.sol";

contract BIHub {
    function isPool(address p) public returns (bool);
}

contract BVault is BTokenBase
//                 , BError
//                 , BNum
{
    BIHub                  public hub;
    ERC20                  public inner;

    constructor(ERC20 token) public {
        hub = BIHub(msg.sender);
        inner = token;
    }

    // User
    function wrap(uint256 amt) public {
        bool xfer = inner.transferFrom(msg.sender, address(this), amt);
        require(xfer, ERR_ERC20_FALSE);

        _balance[msg.sender] += amt;
        _totalSupply += amt;
    }
    function unwrap(uint256 amt) public returns (uint256 out) {
        uint fee = bmul(UNWRAP_FEE, amt);
        out = amt - fee;

        _pull(msg.sender, amt);
        _push(address(hub), fee);
        _burn(out);

        bool xfer = inner.transfer(msg.sender, out);
        require(xfer, ERR_ERC20_FALSE);
        // TODO events (burn?)
    }

    function forceWrap(address whom, uint256 amt) public {
        require(hub.isPool(msg.sender) || msg.sender == address(hub));
    }
    function forceUnwrap(address whom, uint256 amt) public {
        require(hub.isPool(msg.sender) || msg.sender == address(hub));
    }

}
