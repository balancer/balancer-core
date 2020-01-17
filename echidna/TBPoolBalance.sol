import "../crytic-export/flattening/BPool.sol";

contract MyToken is BToken{

    constructor(address owner) public{
        _allowance[owner][msg.sender] = uint256(-1);
        _balance[owner] = uint256(-1);
        _totalSupply = uint256(-1);
    }

}

contract CryticInterface {
    address internal crytic_user = address(0x42424242);
}

contract TBPoolBalance is BPool, CryticInterface {

    MyToken public token;

    constructor() public{
        token = new MyToken(msg.sender);
        bind(address(token), MIN_BALANCE, MIN_WEIGHT);
        setPublicSwap(true);
    }

    function echidna_user_token_balance() public returns(bool){
        return token.balanceOf(crytic_user) == 0;
    }

    function echidna_pool_record_balance() public returns (bool) {
       return (token.balanceOf(address(this)) == this.getBalance(address(token)));
    }
}
