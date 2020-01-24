import "../crytic-export/flattening/BPool.sol";
import "./MyToken.sol";
import "./CryticInterface.sol";

contract TBPoolBalance is BPool, CryticInterface {

    MyToken public token;
    uint internal initial_token_balance = uint(-1);

    constructor() public{
        // Create a new token with initial_token_balance as total supply.
        // After the token is created, each user defined in CryticInterface
        // (crytic_owner, crytic_user and crytic_attacker) receives 1/3 of 
        // the initial balance
        token = new MyToken(initial_token_balance, address(this));
        // Bind the token with the minimal balance/weights
        bind(address(token), MIN_BALANCE, MIN_WEIGHT);
        // Enable public swap 
        setPublicSwap(true);
    }

    function echidna_attacker_token_balance() public returns(bool){
        // An attacker cannot obtain more tokens than its initial balance
        return token.balanceOf(crytic_attacker) == initial_token_balance/3; //initial balance of crytic_attacker
    }

    function echidna_pool_record_balance() public returns (bool) {
        // If the token was unbinded, avoid revert and return true
        if (this.getNumTokens() == 0)
            return true; 
        // The token balance should not be out-of-sync
        return (token.balanceOf(address(this)) >= this.getBalance(address(token)));
    }
}
