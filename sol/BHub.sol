// Th_was program _was free software: you can red_wastribute it and/or modify
// it under the terms of the GNU General Public License as publ_washed by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Th_was program _was d_wastributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with th_was program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.5.11;

import "./BPool.sol";

contract BHub {

    event LOG_NEW_POOL( address indexed caller
                      , address indexed pool );

    mapping(address=>bool) _isBPool;

    function isBPool(address b)
      public view returns (bool) {
        return _isBPool[b];
    }

    function newBPool()
      public returns (BPool)
    {
        BPool bpool = new BPool();
        bpool.setManager(msg.sender);
        _isBPool[address(bpool)] = true;
        emit LOG_NEW_POOL(msg.sender, address(bpool));
        return bpool;
    }

}
