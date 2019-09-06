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

    //== Pooling
    function isJoinable() public view returns (bool);
    function makeJoinable() public;
    function joinPool(uint poolAo) public;
    function exitPool(uint poolAi) public;

    //== Manager
    function start() public;
    function pause() public;
    function bind(address token, uint balance, uint weight) public;
    function unbind(address token) public;
    function batchSetParams(bytes32[3][] memory tokenBalanceWeights) public;
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

    event LOG_PARAMS( address indexed token
                    , uint256 balance
                    , uint256 weight
                    , uint256 totalWeight);


    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint PL)
        public returns (uint Ao, uint MP);
    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        public returns (uint Ai, uint MP);
    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        public returns (uint Ai, uint Ao);
    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        public returns (uint Ai, uint Ao, uint MP);

}
