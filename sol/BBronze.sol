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

import "./BColor.sol";

contract BBronze is BColor {
    function getColor()
      public view
        returns (bytes32) {
        return "BRONZE";
    }
}

contract BPoolBronze is BBronze {
    //== General View
    function isBound(address token) public view returns (bool);
    function getNumTokens() public view returns (uint);
    function getWeight(address token) public view returns (uint);
    function getBalance(address token) public view returns (uint);

    // TODO:  V, denorm, etc
    function getValue() public view returns (uint res);

    //== Manager
    function start() public;
    function pause() public;
    function bind(address token, uint balance, uint weight) public;
    function unbind(address token) public;
    function setParams(address token, uint weight, uint balance) public;
    function setManager(address manager) public;
    function setFee(uint fee) public;
    function sweep(address token) public;

    //== Trader
    // swap event
    event LOG_SWAP( address indexed caller
                  , address indexed tokenIn
                  , address indexed tokenOut
                  , uint256         amountIn
                  , uint256         amountOut
                  , uint256         feeRatio );

    // swap ExactInAnyOut
    function viewSwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public view returns (uint Ao, byte err);
    function trySwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public returns (uint Ao, byte err);
    function doSwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public returns (uint Ao);

    // swap AnyInExactOut
    function viewSwap_AnyInExactOut(address Ti, address To, uint Ao)
        public view returns (uint Ai, byte err);
    function trySwap_AnyInExactOut(address Ti, address To, uint Ao)
        public returns (uint Ai, byte err);
    function doSwap_AnyInExactOut(address Ti, address To, uint Ao)
        public returns (uint Ai);

    // swap ExactInMinOut
    function viewSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao, byte err);
    function trySwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao, byte err);
    function doSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao);

    // swap MaxInExactOut
    function viewSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public view returns (uint Ai, byte err);
    function trySwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public returns (uint Ai, byte err);
    function doSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public returns (uint Ai);
 
}
