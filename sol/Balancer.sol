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

import './BVault.sol';
import './BPool.sol';
import './BHubI.sol';

contract BalancerBronze is BalancerHub
                         , BBronze
                         , BBase
{
    address public BalancerLabs;
    constructor() public {
        BalancerLabs = msg.sender;
    }

    mapping(address=>bool)    internal _isBPool;
    mapping(address=>bool)    internal _isBVault;
    mapping(address=>address) internal _token2vault;

    function isBPool(address p) public returns (bool) {
        return _isBPool[p];
    }

    function isBVault(address v) public returns (bool) {
        return _isBVault[v];
    }

    function getVaultForToken(address token) public returns (address vault)
    {
        require( ! _isBVault[token], ERR_RECURSIVE_VAULT );
        if( _token2vault[token] != address(0x0) ) {
            return _token2vault[token];
        } else {
            vault = address(new BVault(token));
            _isBVault[vault] = true;
            _token2vault[token] = vault;
            return vault;
        }
    }

    function newBPool() public returns (BPool)
    {
        BPool bpool = new BPool();
        bpool.setManager(msg.sender);
        _isBPool[address(bpool)] = true;
        return bpool;
    }
    
    function _setBalancerLabs(address blabs) public
    {
        require(msg.sender == BalancerLabs, ERR_BAD_CALLER);        
        BalancerLabs = blabs;
    }

    function _collect(BVault vault, address to) public
    {
        uint amt = vault.balanceOf(address(this));
        vault.forceUnwrap(address(this), amt);
        vault.inner().transfer(BalancerLabs, amt);
    }
}
