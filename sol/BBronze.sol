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
import "./BConst.sol";

contract BBronze is BColor {
    function getColor()
      public view
        returns (bytes32) {
        return "BRONZE";
    }
}

contract BPoolBronze is BBronze, BConst {
    //== General View
    function isBound(address token) public view returns (bool);
    function getNumTokens() public view returns (uint);
    function getWeight(address token) public view returns (uint);
    function getNormalizedWeight(address token) public view returns (uint);
    function getTotalWeight() public view returns (uint);
    function getBalance(address token) public view returns (uint);
    function getWeightedBalance(address token) public view returns (uint);
    function getWeightedTotalBalance() public view returns (uint);

    //== Pooling
    function isJoinable() public view returns (bool);
    function joinPool(uint poolAo) public;
    function exitPool(uint poolAi) public;

    //== Manager
    function start() public;
    function pause() public;
    function bind(address token, uint balance, uint weight) public;
    function unbind(address token) public;
    function setParams(address token, uint balance, uint weight) public;
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

    // swap ExactInMinOut
    function viewSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public view returns (uint256 Ao, byte err);
    function trySwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao, byte err);
    function doSwap_ExactInMinOut(address Ti, uint256 Ai, address To, uint256 Lo)
        public returns (uint256 Ao);

    // swap ExactInLimitPrice
    function viewSwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public view returns (uint Ao, byte err);
    function trySwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public returns (uint Ao, byte err);
    function doSwap_ExactInLimitPrice(address Ti, uint Ai, address To, uint SER1)
        public returns (uint Ao);

    // swap MaxInExactOut
    function viewSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public view returns (uint Ai, byte err);
    function trySwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public returns (uint Ai, byte err);
    function doSwap_MaxInExactOut(address Ti, uint256 Li, address To, uint Ao)
        public returns (uint Ai);

    // swap LimitPriceInExactOut   TODO  =>LimitPriceExactOut
    function viewSwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint SER1)
      public view returns (uint Ai, byte err);
    function trySwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint Lp)
      public returns (uint Ai, byte err);
    function doSwap_LimitPriceInExactOut(address Ti, address To, uint Ao, uint Lp)
      public returns (uint Ai);

    // swap MaxInMinOutLimitPrice
    function viewSwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public view returns (uint Ai, uint Ao, byte err);
    function trySwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public returns (uint Ai, uint Ao, byte err);
    function doSwap_MaxInMinOutLimitPrice(address Ti, uint Li, address To, uint Lo, uint SER1)
      public returns (uint Ai, uint Ao);


}
