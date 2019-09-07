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

import 'erc20/erc20.sol';
import "./BColor.sol";
import "./BConst.sol";

contract BBronze is BColor {
    function getColor()
      public view
        returns (bytes32) {
        return "BRONZE";
    }
}

contract BPoolBronze is BBronze 
                      , ERC20
{

    // General View
    // ==
    function isBound(address token) public view returns (bool);
    function getNumTokens() public view returns (uint);
    function getWeight(address token) public view returns (uint);
    function getNormalizedWeight(address token) public view returns (uint);
    function getTotalWeight() public view returns (uint);
    function getBalance(address token) public view returns (uint);


    // Pooling
    // ===

    // emits `LOG_CALL`
    // -- 
    function isJoinable() public view returns (bool);
    function makeJoinable(uint initSupply) public;

    // emits `LOG_SWAP` x N
    function joinPool(uint poolAo) public;
    function exitPool(uint poolAi) public;


    // Manager
    // =======

    // emits `LOG_CALL`
    // ---
    function start() public;
    function pause() public;
    function setManager(address manager) public;
    function setFee(uint fee) public;
    function sweep(address token) public;

    // emits `LOG_PARAMS`
    // ---
    function bind(address token, uint balance, uint weight) public;
    function unbind(address token) public;
    function setParams(address token, uint balance, uint weight) public;
    // emits `LOG_PARAMS` x N
    function batchSetParams(bytes32[3][] memory tokenBalanceWeights) public;


    // Trader
    // ===

    // emits `LOG_SWAP`
    // ---
    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint PL)
        public returns (uint Ao, uint MP);
    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        public returns (uint Ai, uint MP);
    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        public returns (uint Ai, uint Ao);
    function swap_ThreeLimitMaximize(address Ti, uint Li, address To, uint Lo, uint PL)
        public returns (uint Ai, uint Ao, uint MP);

}
