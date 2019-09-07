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

import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BBronze.sol";
import "./BError.sol";
import "./BNum.sol";

contract BTokenBase is ERC20
                     , BNum
{
    mapping(address=>
        mapping(address=>uint)) internal _allowance;
    mapping(address=>uint)      internal _balance;
    uint                        internal _totalSupply;

    function allowance(address src, address guy) public view returns (uint) {
        return _allowance[src][guy];
    }
    function balanceOf(address whom) public view returns (uint) {
        return _balance[whom];
    }
    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

    function approve(address guy, uint wad) public returns (bool) {
        require(msg.sender == guy);//, ERR_BAD_CALLER);
        _allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
    }
    function transfer(address dst, uint wad) public returns (bool) {
        _push(dst, wad);
    }
    function transferFrom(address src, address dst, uint wad) public returns (bool) {
        _move(src, dst, wad);
    }

    event LOG_MINT(uint amt);
    event LOG_BURN(uint amt);

    // Internal functions that act on `this`
    function _mint(uint amt) internal {
        _balance[address(this)] = badd(_balance[address(this)], amt);
        _totalSupply   = badd(_totalSupply, amt);
        emit LOG_MINT(amt);
    }
    function _burn(uint amt) internal {
        _balance[address(this)] = bsub(_balance[address(this)], amt);
        _totalSupply   = bsub(_totalSupply, amt);
        emit LOG_BURN(amt);
    }
    function _move(address src, address dst, uint amt) internal {
        _balance[src] = bsub(_balance[src], amt);
        _balance[dst] = badd(_balance[dst], amt);
        emit Transfer(src, dst, amt);
    }
    function _push(address to, uint amt) internal {
        _move(address(this), to, amt);
    }
    function _pull(address from, uint amt) internal {
        _move(from, address(this), amt);
    }
    
}

contract BToken is DSToken
                 , BBronze
{
    ERC20 public inner;

    constructor(bytes32 symbol_, ERC20 inner_)
      public
        DSToken(symbol_)
    {
        inner = inner_;
    }

    function transferFrom(address src, address dst, uint256 amt)
      public
        returns (bool)
    {
        if (_balances[src] < amt) {
            uint256 diff = amt - _balances[src];
            inner.transferFrom(src, address(this), diff);
        }
        return super.transferFrom(src, dst, amt);
    }
}
