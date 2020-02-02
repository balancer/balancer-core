import "./BMathInternal.sol";

// This contract used a modified version of BMath where all the public/external functions are internal to speed up Echidna exploration
contract TestSwapOut is BMath {

    bool public echidna_no_bug = true;

    // A bug is found if tokenAmountOut can be greater than 0 while calcPoolInGivenSingleOut returns 0
    function exitswapExternAmountOut(uint balanceOut, uint poolTotal, uint tokenAmountOut) public {
        // We constraint poolTotal and _records_t_balance
        // To have "realistic" values
        require(poolTotal <= 100 ether);
        require(poolTotal >= 1 ether);

        require(balanceOut <= 10 ether);
        require(balanceOut >= 10**6);

        require(tokenAmountOut > 0);
        require(calcPoolInGivenSingleOut(balanceOut, MIN_WEIGHT, poolTotal, MIN_WEIGHT*2, tokenAmountOut, MIN_FEE)==0);
        echidna_no_bug = false;
    }

}