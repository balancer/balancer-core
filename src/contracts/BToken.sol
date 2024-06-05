// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.23;

import {BNum} from './BNum.sol';

abstract contract BTokenBase is BNum, IERC20 {
  mapping(address => uint256) internal _balance;
  mapping(address => mapping(address => uint256)) internal _allowance;
  uint256 internal _totalSupply;

  function _mint(uint256 amt) internal {
    _balance[address(this)] = badd(_balance[address(this)], amt);
    _totalSupply = badd(_totalSupply, amt);
    emit Transfer(address(0), address(this), amt);
  }

  function _burn(uint256 amt) internal {
    require(_balance[address(this)] >= amt, 'ERR_INSUFFICIENT_BAL');
    _balance[address(this)] = bsub(_balance[address(this)], amt);
    _totalSupply = bsub(_totalSupply, amt);
    emit Transfer(address(this), address(0), amt);
  }

  function _move(address src, address dst, uint256 amt) internal {
    require(_balance[src] >= amt, 'ERR_INSUFFICIENT_BAL');
    _balance[src] = bsub(_balance[src], amt);
    _balance[dst] = badd(_balance[dst], amt);
    emit Transfer(src, dst, amt);
  }
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

  function _push(address to, uint256 amt) internal {
    _move(address(this), to, amt);
  }

  function _pull(address from, uint256 amt) internal {
    _move(from, address(this), amt);
  }
}

contract BToken is BTokenBase {
  string internal _name = 'Balancer Pool Token';
  string internal _symbol = 'BPT';
  uint8 internal _decimals = 18;

  function approve(address dst, uint256 amt) external override returns (bool) {
    _allowance[msg.sender][dst] = amt;
    emit Approval(msg.sender, dst, amt);
    return true;
  }

  function increaseApproval(address dst, uint256 amt) external returns (bool) {
    _allowance[msg.sender][dst] = badd(_allowance[msg.sender][dst], amt);
    emit Approval(msg.sender, dst, _allowance[msg.sender][dst]);
    return true;
  }

  function decreaseApproval(address dst, uint256 amt) external returns (bool) {
    uint256 oldValue = _allowance[msg.sender][dst];
    if (amt > oldValue) {
      _allowance[msg.sender][dst] = 0;
    } else {
      _allowance[msg.sender][dst] = bsub(oldValue, amt);
    }
    emit Approval(msg.sender, dst, _allowance[msg.sender][dst]);
    return true;
  }

  function transfer(address dst, uint256 amt) external override returns (bool) {
    _move(msg.sender, dst, amt);
    return true;
  }

  function transferFrom(address src, address dst, uint256 amt) external override returns (bool) {
    require(msg.sender == src || amt <= _allowance[src][msg.sender], 'ERR_BTOKEN_BAD_CALLER');
    _move(src, dst, amt);
    if (msg.sender != src && _allowance[src][msg.sender] != type(uint256).max) {
      _allowance[src][msg.sender] = bsub(_allowance[src][msg.sender], amt);
      emit Approval(msg.sender, dst, _allowance[src][msg.sender]);
    }
    return true;
  }

  function allowance(address src, address dst) external view override returns (uint256) {
    return _allowance[src][dst];
  }

  function balanceOf(address whom) external view override returns (uint256) {
    return _balance[whom];
  }

  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }

  function decimals() public view returns (uint8) {
    return _decimals;
  }
}
