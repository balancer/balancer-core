# API Reference Index

## Trader 

`viewSwap`, `trySwap`, and `doSwap` for each variant

| Function | Release | Tests? | Docs? |
|-|-|-|-|
`*_ExactInAnyOut` | ❌| ✅|   |
`*_ExactInMinOut` | Bronze🍁| ✅ |  |
`*_AnyInExactOut` | ❌| ✅ |  |
`*_MaxInExactOut` | Bronze🍂|  |  |
`*_ExactInLimitPrice` | Silver👽 |  |  |
`*_LimitPriceExactOut` | Silver🐦 |  |  |
`*_MaxInMinOutLimitPrice` | Silver💿|  |  |
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
`bind(address T, uint B, uint W)` | Bronze🥉
`unbind(address T)` | Bronze🥉
`sweep(address T)` | Bronze🥉
`setParams(address T, uint B, uint W)` | Bronze🥉
`setFee(uint f)` | Bronze🥉
`getBalance(address T) returns (uint)` | Bronze🥉
`getWeight(address T) returns (uint)` | Bronze🥉
`getTotalWeight(address T) returns (uint)` | Bronze🥉
`getNormalizedWeight(address T) returns (uint)` | Bronze🥉
`setWeightAdjustBalance` | Silver🔗
`setBalanceAdjustWeight` | Silver🕊

# API

### `*_ExactInAnyOut` | ❌
### `*_ExactInMinOut` | Bronze🍁
### `*_AnyInExactOut` | ❌
### `*_MaxInExactOut` | Bronze🍂
### `*_ExactInLimitPrice` | Silver👽 
### `*_LimitPriceExactOut` | Silver🐦 
### `*_MaxInMinOutLimitPrice` | Silver💿
### `getSpotPrice(address T) returns (uint)` | Bronze🐻

### `isPoolOpen() returns (bool)` | Bronze🐂
### `getJoinPoolAmounts(uint ptoken_amt_out) returns (uint[MAX_TOKENS])` | Bronze🥉
### `getExitPoolAmounts(uint ptoken_amt_in) returns (uint[MAX_TOKENS])` | Bronze🥉
### `joinPool(uint ptoken_amt_in)` | Bronze🥉
### `exitPool(uint ptoken_amt_out)` | Bronze🥉


### `start`

Starts the pool, enabling `swap` variants. Requires at least 2 bound tokens.

### `pause ()` | Bronze🥉

Pauses the pool, disabling `swap` variants.

### `bind (address T, uint B, uint W)` | Bronze🥉
### `unbind (address T)` | Bronze🥉
### `sweep (address T)` | Bronze🥉
### `setParams (address T, uint B, uint W)` | Bronze🥉
### `setFee (uint f)` | Bronze🥉
### `getBalance (address T) returns (uint)` | Bronze🥉
### `getWeight (address T) returns (uint)` | Bronze🥉
### `getTotalWeight (address T) returns (uint)` | Bronze🥉
### `getNormalizedWeight (address T) returns (uint)` | Bronze🥉
### `setWeightAdjustBalance` | Silver🔗
### `setBalanceAdjustWeight` | Silver🕊


