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

pragma solidity ^0.5.11;

import "./BNum.sol";

// Highly opinionated token implementation

contract BTokenBase is BNum
{
    mapping(address=>
      mapping(address=>uint))   internal _allowance;
    mapping(address=>uint)      internal _balance;
    uint                        internal _totalSupply;

    event Mint(uint amt);
    event Burn(uint amt);
    event Move(address indexed src, address indexed dst, uint amt);

    function sub(uint a, uint b) internal returns (uint) {
        require(a >= b, "ERR_BTOKEN_UNDERFLOW"); // TODO report 'insufficient balance' if that's the case
        return a - b;
    }

    function _mint(uint amt) internal {
        _balance[address(this)] = badd(_balance[address(this)], amt);
        _totalSupply   = badd(_totalSupply, amt);
        emit Mint(amt);
    }

    function _burn(uint amt) internal {
        _balance[address(this)] = sub(_balance[address(this)], amt);
        _totalSupply   = sub(_totalSupply, amt);
        emit Burn(amt);
    }

    function _move(address src, address dst, uint amt) internal {
        _balance[src] = sub(_balance[src], amt);
        _balance[dst] = badd(_balance[dst], amt);
        emit Move(src, dst, amt);
    }

    function _push(address to, uint amt) internal {
        _move(address(this), to, amt);
    }

    function _pull(address from, uint amt) internal {
        _move(from, address(this), amt);
    }

}

contract ERC20 {
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);

    function totalSupply() public view returns (uint);
    function balanceOf(address guy) public view returns (uint);
    function allowance(address src, address guy) public view returns (uint);

    function approve(address guy, uint wad) public returns (bool);
    function transfer(address dst, uint wad) public returns (bool);
    function transferFrom(
        address src, address dst, uint wad
    ) public returns (bool);
}

contract BToken is BBronze, BTokenBase, ERC20
{
    //==  ERC20 is underspecified and bad for the Ethereum ecosystem ==//
    //--                          @realDonaldTrump (Oct 16, 2016)    --//

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
        _allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool) {
        _move(msg.sender, dst, wad);
        emit Transfer(msg.sender, dst, wad);
        return true;
    }

    function transferFrom(address src, address dst, uint wad) public returns (bool) {
        require(msg.sender == src || wad <= _allowance[src][msg.sender], "ERR_BTOKEN_BAD_CALLER");
        _move(src, dst, wad);
        emit Transfer(src, dst, wad);
        if( msg.sender != src && _allowance[src][msg.sender] != uint256(-1) ) {
            _allowance[src][msg.sender] = sub(_allowance[src][msg.sender], wad);
        }
        return true;
    }
}


