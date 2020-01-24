- [Installation](#Installation)
- [Testing with Echidna](#testing-properties-with-echidna)
- [Code verification with Manticore](#Code-verification-with-Manticore)

# Installation

**Slither**
```
pip3 install slither-analyzer
```

**Manticore**
```
pip3 install manticore
```

**Echidna**
See [Echidna Installation](https://github.com/crytic/building-secure-contracts/tree/master/program-analysis/echidna#installation).


# Testing properties with Echidna

`slither-flat` will export the contract and translate external function to public, to faciliate writting properties:
```
slither-flat . --convert-external
```

The flattened contracts are in `crytic-export/flattening`. The Echidna properties are in `echidna/`.

## Properties

Echidna properties can be broadly divided in two categories: general properties of the contracts that states what user can and cannot do and
specific properties based on unit tests.

## General Properties

| Description    | Name           | Contract      | Status   |  
| :---                                                            |     :---:              |         :---:   |  :---:   |
| An attacker cannot steal assets from a public pool.              | [`attacker_token_balance`](echidna/TBPoolBalance.sol#L22-L25)   | [`TBPoolBalance`](echidna/TBPoolBalance.sol) |**FAILED**|
| An attacker cannot force the pool balance to be out-of-sync.  | [`pool_record_balance`](echidna/TBPoolBalance.sol#L27-L33)  | [`TBPoolBalance`](echidna/TBPoolBalance.sol)|**PASSED**|
| An attacker cannot generate free pool tokens with `joinPool` (1, 2).  | [`joinPool`](contracts/test/echidna/TBPoolJoinPool.sol#L7-L31)  | [`TBPoolJoinPool`](contracts/test/echidna/TBPoolBalance.sol)|**FAILED**|
| Calling `joinPool-exitPool` does not lead to free pool tokens (no fee) (1, 2).  | [`joinPool`](contracts/test/echidna/TBPoolJoinExitPoolNoFee.sol#L34-L59)  | [`TBPoolJoinExitNoFee`](contracts/test/echidna/TBPoolJoinExitPoolNoFee.sol)|**FAILED**|
| Calling `joinPool-exitPool` does not lead to free pool tokens (with fee) (1, 2).  | [`joinPool`](contracts/test/echidna/TBPoolJoinExitPool.sol#L37-L62)  | [`TBPoolJoinExit`](contracts/test/echidna/TBPoolJoinExitPool.sol)|**FAILED**|
| Calling `exitswapExternAmountOut` does not lead to free asset (1).  | [`exitswapExternAmountOut`](echidna/TBPoolExitSwap.sol#L8-L21)  | [`TBPoolExitSwap`](contracts/test/echidna/TBPoolExitSwap.sol)|**FAILED**|


(1) These properties target a specific piece of code.

(2) These properties don't need slither-flat, and are integrated into `contracts/test/echidna/`. To run them `echidna . --contract CONTRACT_name --config ./echidna_general_config.yaml`.

## Unit-test-based Properties

| Description    | Name           | Contract      | Status   |  
| :---                                                            |     :---:              |         :---:   |  :---:   |
| If the controller calls `setController`, then the `getController()` should return the new controller.  | [`controller_should_change`](echidna/TBPoolController.sol#L6-L13)  | [`TBPoolController`](echidna/TBPoolController.sol)|**PASSED**|
| The controller cannot be changed to a null address (`0x0`).  | [`controller_cannot_be_null`](echidna/TBPoolController.sol#L15-L23)  | [`TBPoolController`](echidna/TBPoolController.sol)|**FAILED**|
| The controller cannot be changed by other users.  | [`no_other_user_can_change_the_controller`](echidna/TBPoolController.sol#L28-L31)  | [`TBPoolController`](echidna/TBPoolController.sol)|**PASSED**|
| The sum of normalized weight should be 1 if there are tokens binded.  | [`valid_weights`](echidna/TBPoolLimits.sol#L35-L52)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**FAILED**|
| The balances of all the tokens are less or equal than `MAX_BALANCE`.  | [`max_token_balance`](echidna/TBPoolLimits.sol#L54-L63)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**FAILED**|
| The balances of all the tokens are greater or equal than `MIN_BALANCE`.  | [`min_token_balance`](echidna/TBPoolLimits.sol#L65-L74)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**FAILED**|
| The weight of all the tokens are less or equal than `MAX_WEIGHT`.  | [`max_weight`](echidna/TBPoolLimits.sol#L76-L85)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**PASSED**|
| The weight of all the tokens are greater or equal than `MIN_WEIGHT`.  | [`min_weight`](echidna/TBPoolLimits.sol#L87-L96)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**PASSED**|
| The swap fee is less or equal tan `MAX_FEE`. | [`min_swap_free`](echidna/TBPoolLimits.sol#L99-L102)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**PASSED**|
| The swap fee is greater or equal than `MIN_FEE`.  | [`max_swap_free`](echidna/TBPoolLimits.sol#L104-L107)  | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**PASSED**|
| An user can only swap in less than 50% of the current balance of tokenIn for a given pool. | [`max_swapExactAmountIn`](echidna/TBPoolLimits.sol#L134-L156) | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**FAILED**|
| An user can only swap out less than 33.33% of the current balance of tokenOut for a given pool. | [`max_swapExactAmountOut`](echidna/TBPoolLimits.sol#L109-L132) | [`TBPoolLimits`](echidna/TBPoolLimits.sol) |**FAILED**|
| If a token is bounded, the `getSpotPrice` should never revert.  | [`getSpotPrice_no_revert`](echidna/TBPoolNoRevert.sol#L34-L44)  | [`TBPoolNoRevert`](echidna/TBPoolNoRevert.sol) |**PASSED**|
| If a token is bounded, the `getSpotPriceSansFee` should never revert.  | [`getSpotPriceSansFee_no_revert`](echidna/TBPoolNoRevert.sol#L46-L56)  | [`TBPoolNoRevert`](echidna/TBPoolNoRevert.sol) |**PASSED**|
| Calling `swapExactAmountIn` with a small value of the same token should never revert.  | [`swapExactAmountIn_no_revert`](echidna/TBPoolNoRevert.sol#L58-L77)  | [`TBPoolNoRevert`](echidna/TBPoolNoRevert.sol) |**PASSED**|
| Calling `swapExactAmountOut` with a small value of the same token should never revert. | [`swapExactAmountOut_no_revert`](echidna/TBPoolNoRevert.sol#L79-L99)  | [`TBPoolNoRevert`](echidna/TBPoolNoRevert.sol) |**PASSED**|
| If a user joins pool and exits it with the same amount, the balances should keep constant.  | [`joinPool_exitPool_balance_consistency`](echidna/TBPoolJoinExit.sol#L48-L97)  | [`TBPoolJoinExit`](echidna/TBPoolJoinExit.sol) |**PASSED**|
| If a user joins pool and exits it with a larger amount, `exitPool` should revert.  | [`impossible_joinPool_exitPool`](echidna/TBPoolJoinExit.sol#L99-L112) | [`TBPoolJoinExit`](echidna/TBPoolJoinExit.sol) |**PASSED**|
| It is not possible to bind more than `MAX_BOUND_TOKENS`. | [`getNumTokens_less_or_equal_MAX_BOUND_TOKENS`](echidna/TBPoolBind.sol#L40-L43)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| It is not possible to bind more than once the same token.  | [`bind_twice`](echidna/TBPoolBind.sol#L45-L54)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| It is not possible to unbind more than once the same token. | [`unbind_twice`](echidna/TBPoolBind.sol#L56-L66)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| It is always possible to unbind a token.  | [`all_tokens_are_unbindable`](echidna/TBPoolBind.sol#L68-L81)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| All tokens are rebindable with valid parameters. | [`all_tokens_are_rebindable_with_valid_parameters`](echidna/TBPoolBind.sol#L83-L95)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| It is not possible to rebind an unbinded token. | [`rebind_unbinded`](echidna/TBPoolBind.sol#L97-L107)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| Only the controller can bind. | [`when_bind`](echidna/TBPoolBind.sol#L150-L154) and [`only_controller_can_bind`](echidna/TBPoolBind.sol#L145-L148) | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| If a user that is not the controller, tries to bind, rebind or unbind, the operation will revert. | [`when_bind`](echidna/TBPoolBind.sol#L150-L154), [`when_rebind`](echidna/TBPoolBind.sol#L150-L154) and [`when_unbind`](echidna/TBPoolBind.sol#L163-L168)  | [`TBPoolBind`](echidna/TBPoolBind.sol) |**PASSED**|
| The contract complies with basic ERC20 properties | `TODO`  | [`TBTokenERC20`](echidna/TBTokenERC20.sol) |**TODO**|

# Code verification with Manticore

The following properties have equivalent Echidna property, but Manticore allows to either prove the absence of bugs, or look for an upper bound.


| Description    | Script           | Contract      | Status   |  
| :---                                                            |     :---:              |         :---:   |  :---:   |
| An attacker cannot generate free pool tokens with `joinPool`.  | [`joinPool`](manticore/contracts/TBPoolJoinPool.sol#L7-L31)  | [`TBPoolJoinPool`](manticore/contracts/TBPoolBalance.sol)|**FAILED**|
| Calling `joinPool-exitPool` does not lead to free pool tokens (no fee).  | [`joinAndExitNoFeePool`](manticore/contracts/TBPoolJoinExitPoolNoFee.sol#L34-L59)  | [`TBPoolJoinExitNoFee`](manticore/contracts/TBPoolJoinExitPoolNoFee.sol)|**FAILED**|
| Calling `joinPool-exitPool` does not lead to free pool tokens (with fee).  | [`joinAndExitPool`](manticore/contracts/TBPoolJoinExitPool.sol#L37-L62)  | [`TBPoolJoinExit`](manticore/contracts/TBPoolJoinExitPool.sol)|**FAILED**|
