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

import "./BBronze.sol";
import "./BConst.sol";

import "./BToken.sol";
import "./BPool.sol";

contract BFactory is BBronze
                   , BConst
{
    mapping(address=>bool) public isBTokenBuiltHere;
    mapping(address=>bool) public isBPoolBuiltHere;
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
        isBPoolBuiltHere[address(bpool)] = true;
        isBTokenBuiltHere[address(poolcoin)] = true;
        emit LOG_newBPool(msg.sender, address(bpool), address(poolcoin));
        return bpool;
    }
}
