import "../crytic-export/flattening/BPool.sol";
import "./MyToken.sol";
import "./CryticInterface.sol";

contract TBPoolJoinExit is CryticInterface, BPool {

    uint MAX_BALANCE = BONE * 10**12;

    constructor() public {
        MyToken t;
        t = new MyToken(uint(-1), address(this));
        bind(address(t), MAX_BALANCE, MAX_WEIGHT); 
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
        return address(bt);
    }

    uint[] internal maxAmountsIn = [uint(-1), uint(-1), uint(-1), uint(-1), uint(-1), uint(-1)];
    uint[] internal minAmountsOut = [0, 0, 0, 0, 0, 0, 0, 0];
    uint[8] internal balances = [0, 0, 0, 0, 0, 0, 0, 0];

    uint internal amount = EXIT_FEE;
    uint internal amount1 = EXIT_FEE;
    uint internal amount2 = EXIT_FEE;

    // sets an amount between EXIT_FEE and EXIT_FEE + 2**64 
    function set_input(uint _amount) public {
        amount = EXIT_FEE + _amount % 2**64;
    }

    // sets two amounts between EXIT_FEE and EXIT_FEE + 2**64
    function set_two_inputs(uint _amount1, uint _amount2) public {
        amount1 = EXIT_FEE + _amount1 % 2**64;
        amount2 = EXIT_FEE + _amount2 % 2**64;
    }

    function echidna_joinPool_exitPool_balance_consistency() public returns (bool) {
     
        // if the pool was not finalize, return true (it is unclear how to finalize it) 
        if (!this.isFinalized())
            return true;

        // check this precondition for joinPool
        if (bdiv(amount, this.totalSupply()) == 0)
            return true;

        // save all the token balances in `balances` before calling joinPool / exitPool
        address[] memory current_tokens = this.getCurrentTokens();
        for (uint i = 0; i < current_tokens.length; i++)
            balances[i] = (IERC20(current_tokens[i]).balanceOf(address(msg.sender)));
 
        // save the amount of share tokens
        uint old_balance = this.balanceOf(crytic_owner);

        // call joinPool, with some some reasonable amount
        joinPool(amount, maxAmountsIn);
        // check that the amount of shares decreased
        if (this.balanceOf(crytic_owner) - amount != old_balance)
            return false; 

        // check the precondition for exitPool
        uint exit_fee = bmul(amount, EXIT_FEE); 
        uint pAiAfterExitFee = bsub(amount, exit_fee);
        if(bdiv(pAiAfterExitFee, this.totalSupply()) == 0)
            return true;

        // call exitPool with some reasonable amount
        exitPool(amount, minAmountsOut);
        uint new_balance = this.balanceOf(crytic_owner);
         
        // check that the amount of shares decreased, taking in consideration that 
        // _factory is crytic_owner, so it will receive the exit_fees 
        if (old_balance != new_balance - exit_fee)
            return false;

        // verify that the final token balance are consistent. It is possible
        // to have rounding issues, but it should not allow to obtain more tokens than
        // the ones a user owned
        for (uint i = 0; i < current_tokens.length; i++) {
            uint current_balance = IERC20(current_tokens[i]).balanceOf(address(msg.sender));
            if (balances[i] < current_balance)
                return false; 
        }
 
        return true;
    }

    function echidna_revert_impossible_joinPool_exitPool() public returns (bool) {

        // the amount to join should be smaller to the amount to exit
        if (amount1 >= amount2)
            revert();

        // burn all the shares transfering them to 0x0
        transfer(address(0x0), this.balanceOf(msg.sender));
        // join a pool with a reasonable amount. 
        joinPool(amount1, maxAmountsIn);
        // exit a pool with a larger amount
        exitPool(amount2, minAmountsOut);
        return true;
    }

}
