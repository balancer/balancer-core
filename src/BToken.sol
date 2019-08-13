pragma solidity ^0.5.10;

import 'ds-token/token.sol';

contract BToken is DSToken {
    constructor(bytes32 name)
        DSToken(name)
        public
    {}
}
