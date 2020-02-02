import "../crytic-export/flattening/BPool.sol";
import "./MyToken.sol";
import "./CryticInterface.sol";

contract TBPoolNoRevert is CryticInterface, BPool {

    constructor() public { // out-of-gas?
        // Create a new token with initial_token_balance as total supply.
        // After the token is created, each user defined in CryticInterface
        // (crytic_owner, crytic_user and crytic_attacker) receives 1/3 of 
        // the initial balance
        MyToken t;
        t = new MyToken(initial_token_balance, address(this));
        bind(address(t), MIN_BALANCE, MIN_WEIGHT); 
    }

    // initial token balances is the max amount for uint256
    uint internal initial_token_balance = uint(-1);

    // this function allows to create as many tokens as needed
    function create_and_bind(uint balance, uint denorm) public returns (address) {
        // Create a new token with initial_token_balance as total supply.
        // After the token is created, each user defined in CryticInterface
        // (crytic_owner, crytic_user and crytic_attacker) receives 1/3 of 
        // the initial balance
        MyToken bt = new MyToken(initial_token_balance, address(this));
        bt.approve(address(this), initial_token_balance); 
        // Bind the token with the provided parameters
        bind(address(bt), balance, denorm); 
        // Save the balance and denorm values used. These are used in the rebind checks
        return address(bt);
    }
    
    function echidna_getSpotPrice_no_revert() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            for (uint j = 0; j < current_tokens.length; j++) {
                // getSpotPrice should not revert for any pair of tokens
                this.getSpotPrice(address(current_tokens[i]), address(current_tokens[j]));
            }
        }

       return true;
    }

    function echidna_getSpotPriceSansFee_no_revert() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            for (uint j = 0; j < current_tokens.length; j++) {
                // getSpotPriceSansFee should not revert for any pair of tokens
                this.getSpotPriceSansFee(address(current_tokens[i]), address(current_tokens[j]));
            }
        }

       return true;
    }

    function echidna_swapExactAmountIn_no_revert() public returns (bool) {
        // if the controller was changed, return true
        if (this.getController() != crytic_owner)
            return true;

        // if the pool was not finalized, enable the public swap
        if (!this.isFinalized())
            setPublicSwap(true);
 
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            // a small balance is 1% of the total balance available
            uint small_balance = this.getBalance(current_tokens[i])/100; 
            // if the user has a small balance, it should be able to swap it
            if (IERC20(current_tokens[i]).balanceOf(crytic_owner) > small_balance)
               swapExactAmountIn(address(current_tokens[i]), small_balance, address(current_tokens[i]), 0, uint(-1));
        }

        return true;
    }

    function echidna_swapExactAmountOut_no_revert() public returns (bool) {
 
        // if the controller was changed, return true
        if (this.getController() != crytic_owner)
            return true;

        // if the pool was not finalized, enable the public swap
        if (!this.isFinalized())
            setPublicSwap(true);
 
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            // a small balance is 1% of the total balance available
            uint small_balance = this.getBalance(current_tokens[i])/100; 
            // if the user has a small balance, it should be able to swap it
            if (IERC20(current_tokens[i]).balanceOf(crytic_owner) > small_balance)
                swapExactAmountOut(address(current_tokens[i]), uint(-1), address(current_tokens[i]), small_balance, uint(-1));
        }

        return true;
    }

}

