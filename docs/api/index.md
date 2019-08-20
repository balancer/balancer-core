# API Reference Index

## Trader 

`viewSwap`, `trySwap`, and `doSwap` for each variant

| Function | Release | Tests? | Docs? |
|-|-|-|-|
`*_ExactInAnyOut` | ❌| ✅|   |
`*_ExactInMinOut` | Bronze🍁| ✅ |  |
`*_AnyInExactOut` | ❌| ✅ |  |
`*_MaxInExactOut` | Bronze🍂|  |  |
`*_ExactInLimitPrice` | Silver👽? |  |  |
`*_LimitPriceExactOut` | Silver🐦? |  |  |
`*_MaxInMinOutLimitPrice` | Silver💿? |  |  |
`getSpotPrice(address T) returns (uint)` | Bronze🐻 | |

## Pooling

Function | Release | Tests? | Docs? |
-|-|-|-
`isPoolOpen() returns (bool)` | Bronze🐂
`getJoinPoolAmounts(uint ptoken_amt_out) returns (uint[MAX_TOKENS])` | Bronze🥉
`getExitPoolAmounts(uint ptoken_amt_in) returns (uint[MAX_TOKENS])` | Bronze🥉
`joinPool(uint ptoken_amt_in)` | Bronze🥉
`exitPool(uint ptoken_amt_out)` | Bronze🥉

## Manager 

Function | Release | Tests? | Docs? 
-|-|-|-
[`start()`](#start) | Bronze🥉
[`pause()`](#pause) | Bronze🥉
[`bind(address T, uint B, uint W)`](#bind) | Bronze🥉
`unbind(address T)` | Bronze🥉
`sweep(address T)` | Bronze🥉
`setParams(address T, uint B, uint W)` | Bronze🥉
`setFee(uint f)` | Bronze🥉
`getBalance(address T) returns (uint)` | Bronze🥉
`getWeight(address T) returns (uint)` | Bronze🥉
`getTotalWeight() returns (uint)` | Bronze🥉

# API

### `*_ExactInAnyOut`
### `*_ExactInMinOut`
### `*_AnyInExactOut`
### `*_MaxInExactOut`
### `*_ExactInLimitPrice`
### `*_LimitPriceExactOut`
### `*_MaxInMinOutLimitPrice`
### `getSpotPrice(address T) returns (uint)`


### `isPoolOpen() returns (bool)`
### `getJoinPoolAmounts(uint ptoken_amt_out) returns (uint[MAX_TOKENS])`
### `getExitPoolAmounts(uint ptoken_amt_in) returns (uint[MAX_TOKENS])`
### `joinPool(uint ptoken_amt_in)`
### `exitPool(uint ptoken_amt_out)`


### `start`

Starts the pool, enabling `swap` variants. Requires at least 2 bound tokens.

### `pause()`

Pauses the pool, disabling `swap` variants.

### `bind`
`bind(address T, uint B, uint W)`
### `unbind`
`unbind(address T)`
### `sweep`
`sweep(address T)`
### `setParams`
`setParams(address T, uint B, uint W)`
### `setFee`
`setFee(uint f)`
### `getBalance`
`getBalance(address T) returns (uint)`
### `getWeight`
`getWeight(address T) returns (uint)`
### `getTotalWeight`
`getTotalWeight(address T) returns (uint)`


