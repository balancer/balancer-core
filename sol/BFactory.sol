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

import 'ds-token/token.sol';

import "./BBronze.sol";

import "./BPool.sol";

contract BFactory is BBronze
{
    mapping(address=>bool) public isBPool;

    event LOG_newBPool( address indexed initialManager
                      , address indexed pool );

    function newBPool()
      public returns (BPool)
    {
        BPool bpool = new BPool();
        bpool.setManager(msg.sender);
        isBPool[address(bpool)] = true;
        emit LOG_newBPool(msg.sender, address(bpool));
        return bpool;
    }
}
