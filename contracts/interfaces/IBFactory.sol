// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.5.12;

import "./IBPool.sol";


interface IBFactory {
    function newBPool() external returns (IBPool);
    function setBLabs(address b) external;
    function collect(IBPool pool) external;
    function isBPool(address b) external view returns (bool);
    function getBLabs() external view returns (address);
}
