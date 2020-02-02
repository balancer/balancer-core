import "../crytic-export/flattening/BPool.sol";
import "./MyToken.sol";
import "./CryticInterface.sol";

contract TBPoolBindPrivileged is CryticInterface, BPool {

    constructor() public {
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
    // these two variables are used to save valid balances and denorm parameters
    uint internal valid_balance_to_bind = MIN_BALANCE;
    uint internal valid_denorm_to_bind = MIN_WEIGHT;


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
        valid_balance_to_bind = balance;
        valid_denorm_to_bind = denorm;
        return address(bt);
    }

    function echidna_getNumTokens_less_or_equal_MAX_BOUND_TOKENS() public returns (bool) {
        // it is not possible to bind more than `MAX_BOUND_TOKENS` 
        return this.getNumTokens() <= MAX_BOUND_TOKENS;
    }

    function echidna_revert_bind_twice() public returns (bool) {
        if (this.getCurrentTokens().length > 0 && this.getController() == crytic_owner && !this.isFinalized()) {
            // binding the first token should be enough, if we have this property to always revert
            bind(this.getCurrentTokens()[0], valid_balance_to_bind, valid_denorm_to_bind);
            // This return will make this property to fail
            return true;
        }
        // If there are no tokens or if the controller was changed or if the pool was finalized, just revert.
        revert();
    }

    function echidna_revert_unbind_twice() public returns (bool) {
        if (this.getCurrentTokens().length > 0 && this.getController() == crytic_owner && !this.isFinalized()) {
            address[] memory current_tokens = this.getCurrentTokens();
            // unbinding the first token twice should be enough, if we want this property to always revert
            unbind(current_tokens[0]);
            unbind(current_tokens[0]);
            return true;
        }
        // if there are no tokens or if the controller was changed or if the pool was finalized, just revert
        revert();
    }

    function echidna_all_tokens_are_unbindable() public returns (bool) {
        if (this.getController() == crytic_owner && !this.isFinalized()) {
            address[] memory current_tokens = this.getCurrentTokens();
            // unbind all the tokens, one by one
            for (uint i = 0; i < current_tokens.length; i++) {
                unbind(current_tokens[i]);
            }
            // at the end, the list of current tokens should be empty
            return (this.getCurrentTokens().length == 0);
        }

        // if the controller was changed or if the pool was finalized, just return true
        return true;
    }

    function echidna_all_tokens_are_rebindable_with_valid_parameters() public returns (bool) {
        if (this.getController() == crytic_owner && !this.isFinalized()) {
            address[] memory current_tokens = this.getCurrentTokens();
            for (uint i = 0; i < current_tokens.length; i++) {
                // rebind all the tokens, one by one, using valid parameters
                rebind(current_tokens[i], valid_balance_to_bind, valid_denorm_to_bind);
            }
            // at the end, the list of current tokens should have not change in size
            return current_tokens.length == this.getCurrentTokens().length;
        }
        // if the controller was changed or if the pool was finalized, just return true 
        return true;
    }

    function echidna_revert_rebind_unbinded() public returns (bool) {
        if (this.getCurrentTokens().length > 0 && this.getController() == crytic_owner && !this.isFinalized()) {
            address[] memory current_tokens = this.getCurrentTokens();
            // unbinding and rebinding the first token should be enough, if we want this property to always revert
            unbind(current_tokens[0]);
            rebind(current_tokens[0], valid_balance_to_bind, valid_denorm_to_bind);
            return true;
        }
        // if the controller was changed or if the pool was finalized, just return true  
        revert();
    }
}

contract TBPoolBindUnprivileged is CryticInterface, BPool {

    MyToken t1;
    MyToken t2;    
    // initial token balances is the max amount for uint256
    uint internal initial_token_balance = uint(-1);
 
    constructor() public {
        // two tokens with minimal balances and weights are created by the controller
        t1 = new MyToken(initial_token_balance, address(this));
        bind(address(t1), MIN_BALANCE, MIN_WEIGHT);
        t2 = new MyToken(initial_token_balance, address(this));
        bind(address(t2), MIN_BALANCE, MIN_WEIGHT);
    }
   
    // these two variables are used to save valid balances and denorm parameters
    uint internal valid_balance_to_bind = MIN_BALANCE;
    uint internal valid_denorm_to_bind = MIN_WEIGHT;

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
        valid_balance_to_bind = balance;
        valid_denorm_to_bind = denorm;
        return address(bt);
    }

    function echidna_only_controller_can_bind() public returns (bool) {
        // the number of tokens cannot be changed
        return this.getNumTokens() == 2;
    }

    function echidna_revert_when_bind() public returns (bool) {
         // calling bind will revert
         create_and_bind(valid_balance_to_bind, valid_denorm_to_bind); 
         return true;
    } 

    function echidna_revert_when_rebind() public returns (bool) {
          // calling rebind on binded tokens will revert
          rebind(address(t1), valid_balance_to_bind, valid_denorm_to_bind);
          rebind(address(t2), valid_balance_to_bind, valid_denorm_to_bind);
          return true;
    }

    function echidna_revert_when_unbind() public returns (bool) {
          // calling unbind on binded tokens will revert 
          unbind(address(t1));
          unbind(address(t2));
          return true;
    }  
}
