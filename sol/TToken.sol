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

contract TToken is ERC20 {
    uint                   supply;
    mapping(address=>uint) balances;
    function balanceOf(address whom) public view returns (uint) {
        return balances[whom];
    }
    function totalSupply() public view returns (uint) {
        return supply;
    }
    function allowance(address who, address cares) public view returns (uint) {
        return uint(-1);
    }
    function approve(address who, uint256 cares) public returns (bool) {
        emit Approval(msg.sender, who, cares);
        return true;
    }
    function transfer(address to, uint amount) public returns (bool) {
        return transferFrom(msg.sender, to, amount);
    }
    function transferFrom(address from, address to, uint amount) public returns (bool) {
        require(balances[from] >= amount, "TToken-insufficient-balance");
        balances[from] -= amount;
        balances[to]   += amount;
        emit Transfer(from, to, amount);
        return true;
    } 
    function mint(uint256 amount) public {
        balances[msg.sender] += amount;
        supply               += amount;
        require(supply >= amount, "TToken-mint-overflow");
    }
    function burn() public {
        supply -= balances[address(this)];
        balances[address(this)]  = 0;
    }
}
