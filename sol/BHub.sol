contract BHub {
    address private _blabs;
    mapping(address=>address) private _token2vault;

    mapping(address=>bool) public isBPool;
    mapping(address=>bool) public isBShare;
    mapping(address=>bool) public isBVault;

    function getVaultForToken(address token) returns (address vault) {
        if( _token2vault[token] != address(0x0) ) {
            return _token2vault[token];
        } else {
            BVault vault = new BVault();
            _token2vault[token] = address(vault);
            return address(vault);
        }
    }

    function newBPool() {
        BPool bpool = new BPool();
        bpool.setManager(msg.sender);
        isBPool[address(bpool)] = true;
        return bpool;
    }
    
    function _setBLabs(address blabs) {
        _blabs = blabs;
    }

    function _collect(BVault vault, address to) {
        vault.forceUnwrap(this, vault.balanceOf(this));
        vault.inner().transfer(blabs, inner.balanceOf(this));
    }
}
