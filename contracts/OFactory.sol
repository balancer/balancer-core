// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is disstributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.5.12;

// Builds new BPools, logging their addresses and providing `isBPool(address) -> (bool)`

import "./OPool.sol";

contract OFactory is BBronze {
    event LOG_NEW_POOL(
        address indexed caller,
        address indexed pool
    );

    event LOG_OLABS(
        address indexed caller,
        address indexed olabs
    );

    mapping(address=>bool) private _isOPool;

    function isOPool(address o)
        external view returns (bool)
    {
        return _isOPool[o];
    }

    function newOPool()
        external
        returns (OPool)
    {
        OPool opool = new OPool();
        _isOPool[address(opool)] = true;
        emit LOG_NEW_POOL(msg.sender, address(opool));
        bpool.setController(msg.sender);
        return opool;
    }

    address private _olabs;

    constructor() public {
        _olabs = msg.sender;
    }

    function getOLabs()
        external view
        returns (address)
    {
        return _olabs;
    }

    function setOLabs(address o)
        external
    {
        require(msg.sender == _olabs, "ERR_NOT_OLABS");
        emit LOG_OLABS(msg.sender, o);
        _olabs = o;
    }

    function collect(OPool pool)
        external 
    {
        require(msg.sender == _olabs, "ERR_NOT_OLABS");
        uint collected = IERC20(pool).balanceOf(address(this));
        bool xfer = pool.transfer(_olabs, collected);
        require(xfer, "ERR_ERC20_FAILED");
    }
}
