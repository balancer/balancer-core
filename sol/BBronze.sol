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

contract BBronze {
    //bool    public paused;
    //address public manager;
    //uint256 public fee;

    //uint256 public totalWeight;
    //uint8   public numTokens;

    function isBound(address token)
        public view returns (bool);
    function getWeight(address token)
        public view returns (uint256);
    function getBalance(address token)
        public view returns (uint256);
    function getValue()
        public view returns (uint256 res);
    function getWeightedValue()
        public view returns (uint256 Wt);

    function start()
        public;
    function pause()
        public;
    function bind(address token, uint256 balance, uint256 weight)
        public;
    function unbind(address token)
        public;
    function setParams(address token, uint256 weight, uint256 balance)
        public;
    function setManager(address manager)
        public;
    function setFee(uint256 fee)
        public;
    function sweep(address token)
        public;

    function viewSwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public view returns (uint256 Ao, byte err);
    function trySwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public returns (uint256 Ao, byte err);
    function doSwap_ExactInAnyOut(address Ti, uint256 Ai, address To)
        public returns (uint256 Ao);

    function viewSwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public view returns (uint256 Ai, byte err);
    function trySwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public returns (uint256 Ai, byte err);
    function doSwap_ExactOutAnyIn(address Ti, address To, uint256 Ao)
        public returns (uint256 Ai);
}
