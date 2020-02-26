import "../crytic-export/flattening/BPool.sol";
import "./MyToken.sol";
import "./CryticInterface.sol";

contract TBPoolLimits is CryticInterface, BPool {

    uint MAX_BALANCE = BONE * 10**12;

    constructor() public {
        MyToken t;
        t = new MyToken(uint(-1), address(this));
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

    function echidna_valid_weights() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        // store the normalized weight in this variable
        uint nw = 0;
        for (uint i = 0; i < current_tokens.length; i++) {
            // accumulate the total normalized weights, checking for overflows
            nw = badd(nw,this.getNormalizedWeight(current_tokens[i]));
        }
        // convert the sum of normalized weights into an integer
        nw = btoi(nw);

        // if there are no tokens, check that the normalized weight is zero
        if (current_tokens.length == 0)
            return (nw == 0);

        // if there are tokens, the normalized weight should be 1
        return (nw == 1);
    }

    function echidna_min_token_balance() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
             // verify that the balance of each token is more than `MIN_BALACE` 
            if (this.getBalance(address(current_tokens[i])) < MIN_BALANCE)
                return false;
        }
        // if there are no tokens, return true 
        return true;
    }

    function echidna_max_weight() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            // verify that the weight of each token is less than `MAX_WEIGHT`  
            if (this.getDenormalizedWeight(address(current_tokens[i])) > MAX_WEIGHT)
                return false;
        }
        // if there are no tokens, return true 
        return true;
    }

    function echidna_min_weight() public returns (bool) {
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++) {
            // verify that the weight of each token is more than `MIN_WEIGHT`  
            if (this.getDenormalizedWeight(address(current_tokens[i])) < MIN_WEIGHT)
                return false;
        }
        // if there are no tokens, return true 
        return true;
    }


    function echidna_min_swap_free() public returns (bool) {
        // verify that the swap fee is greater or equal than `MIN_FEE`
        return this.getSwapFee() >= MIN_FEE;
    }

    function echidna_max_swap_free() public returns (bool) {
        // verify that the swap fee is less or equal than `MAX_FEE`
        return this.getSwapFee() <= MAX_FEE;
    }

    function echidna_revert_max_swapExactAmountOut() public returns (bool) {
        // if the controller was changed, revert
        if (this.getController() != crytic_owner)
            revert();

        // if the pool is not finalized, make sure public swap is enabled
        if (!this.isFinalized())
            setPublicSwap(true);
 
        address[] memory current_tokens = this.getCurrentTokens();
        // if there is not token, revert
        if (current_tokens.length == 0)
            revert();

        uint large_balance = this.getBalance(current_tokens[0])/3 + 2;

        // check that the balance is large enough
        if (IERC20(current_tokens[0]).balanceOf(crytic_owner) < large_balance)
            revert();

        // call swapExactAmountOut with more than 1/3 of the balance should revert
        swapExactAmountOut(address(current_tokens[0]), uint(-1), address(current_tokens[0]), large_balance, uint(-1));
        return true;
    }
    
    function echidna_revert_max_swapExactAmountIn() public returns (bool) {
        // if the controller was changed, revert
        if (this.getController() != crytic_owner)
           revert();

        // if the pool is not finalized, make sure public swap is enabled  
        if (!this.isFinalized())
           setPublicSwap(true);

        address[] memory current_tokens = this.getCurrentTokens();
        // if there is not token, revert
        if (current_tokens.length == 0)
            revert();

        uint large_balance = this.getBalance(current_tokens[0])/2 + 1;

        if (IERC20(current_tokens[0]).balanceOf(crytic_owner) < large_balance)
            revert();

        swapExactAmountIn(address(current_tokens[0]), large_balance, address(current_tokens[0]), 0, uint(-1));

        return true;
    }

}
