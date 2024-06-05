// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.23;

import {BNum} from './BNum.sol';

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BToken is BNum, ERC20 {
  constructor() ERC20('Balancer Pool Token', 'BPT') {}

  function increaseApproval(address dst, uint256 amt) external returns (bool) {
    _approve(msg.sender, dst, allowance(msg.sender, dst) + amt);
    return true;
  }

  function decreaseApproval(address dst, uint256 amt) external returns (bool) {
    uint256 oldValue = allowance(msg.sender, dst);
    if (amt > oldValue) {
      _approve(msg.sender, dst, 0);
    } else {
      _approve(msg.sender, dst, oldValue - amt);
    }
    return true;
  }

  function _push(address to, uint256 amt) internal {
    _transfer(address(this), to, amt);
  }

  function _pull(address from, uint256 amt) internal {
    _transfer(from, address(this), amt);
  }
}
