pragma solidity ^0.5.1;

import "./USDiToken.sol";

contract Yeildlock {

  USDiToken public usdi;
  address public beneficiary;
  uint256 public releaseTime = 180 days;

  constructor(
    USDiToken _usdi,
    address _beneficiary,
    uint256 _releaseTime
  )
    public
  {
    require(_releaseTime > block.timestamp);
    usdi = _usdi;
    beneficiary = _beneficiary;
    releaseTime = _releaseTime;
  }

  function release() public {
    require(block.timestamp >= releaseTime);

    uint256 amount = token.balanceOf(address(this));
    require(amount > 0);

    token.transfer(beneficiary, amount);
  }
}

