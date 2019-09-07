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

pragma solidity ^0.5.10;

import "./BColor.sol";
import "./BPool.sol";

contract BFactory is BBronze {
    event NEW_POOL(address indexed caller, address indexed pool, bytes32 indexed color);
    mapping(address=>bool) public isBPool;

    function newBPool()
      public returns (BPool)
    {
        BPool bpool = new BPool();
        bpool.setManager(msg.sender);
        isBPool[address(bpool)] = true;
        emit NEW_POOL(msg.sender, address(bpool), getColor());
        return bpool;
    }

}

