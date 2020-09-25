pragma solidity =0.5.16;

import '@openzepplin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeplin/contracts/token/ERC20/ERC20.sol';

contract Token1 is ERC20Detailed, ERC20 {
constructor() ERC20Detailed('Token1, 'TK1', 18) public {}

