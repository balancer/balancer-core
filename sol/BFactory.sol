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
import "./BConst.sol";

import "./BToken.sol";
import "./BPool.sol";

contract BFactory is BBronze
                   , BConst
{
    mapping(address=>bool) public _wasBTokenBuiltHere;
    mapping(address=>bool) public wasBPoolBuiltHere;

//    function wasBPoolBuiltHere(address bp) public returns (bool) { return _wasBPoolBuiltHere[bp]; }

    event LOG_newBPool( address indexed caller
                       , address pool
                       , address poolcoin );
    function newBPool()
      public
        returns (BPool)
    {
        BToken poolcoin = new BToken();
        BPool bpool = new BPool(address(poolcoin));
        bpool.setManager(msg.sender);
        wasBPoolBuiltHere[address(bpool)] = true;
        _wasBTokenBuiltHere[address(poolcoin)] = true;
        emit LOG_newBPool(msg.sender, address(bpool), address(poolcoin));
        return bpool;
    }
}
