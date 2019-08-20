# API Reference Index

## Trader 

Each `swap` functions comes in three variations: [`viewSwap*`, `trySwap*`, and `doSwap*`](view-try-do.md)

| Function | Release | Tests? | Docs? |
|-|-|-|-|
[`*Swap_ExactInAnyOut`](#swap_ExactInMinOut) | Bronze🍂| ✅ |  |
[`*Swap_ExactInMinOut`](#swap_ExactInMinOut) | Bronze🍂| ✅ |  |
[`*Swap_ExactInLimitPrice`]() | Bronze🍂 |  |  |
[`*Swap_AnyInExactOut`](#swap_MaxInExactOut) | Bronze🍂| ✅ |  |
[`*Swap_MaxInExactOut`](#swap_MaxInExactOut) | Bronze🍂| ✅ |  |
[`*Swap_LimitPriceExactOut`]() | Bronze🍂 |  |  |
[`*Swap_MaxInMinOutLimitPrice`]() | Bronze🍂 |  |  |
[`getSpotPrice(address T) returns (uint)`](#getSpotPrice) | Bronze🍂 | ✅ | |

## Pooling

Function | Release | Tests? | Docs? |
-|-|-|-
[`isPoolOpen() returns (bool)`](#isPoolOpen) | Bronze🍂
[`getJoinPoolAmounts(uint ptoken_amt_out) returns (uint[MAX_TOKENS])`](#getJoinPoolAmounts) | Bronze🍂
[`getExitPoolAmounts(uint ptoken_amt_in) returns (uint[MAX_TOKENS])`](#getExitPoolAmounts) | Bronze🍂
[`joinPool(uint ptoken_amt_in)`](#joinPool) | Bronze🍂
[`exitPool(uint ptoken_amt_out)`](#exitPool) | Bronze🍂

## Manager 

Function | Release | Tests? | Docs? 
-|-|-|-
[`start()`](#start) | Bronze🍂
[`pause()`](#pause) | Bronze🍂
[`bind(address T, uint B, uint W)`](#bind) | Bronze🍂
[`unbind(address T)`](#unbind) | Bronze🍂
[`sweep(address T)`](#sweep) | Bronze🍂
[`setParams(address T, uint B, uint W)`](#setParams) | Bronze🍂
[`setFee(uint f)`](#setFee) | Bronze🍂
[`getBalance(address T) returns (uint)`](#getBalance) | Bronze🍂
[`getWeight(address T) returns (uint)`](#getWeight) | Bronze🍂
[`getTotalWeight() returns (uint)`](#getTotalWeight) | Bronze🍂

# API

### `getSpotPrice(address T) returns (uint)`
`getSpotPrice(address T) returns (uint)`
### `*Swap_ExactInAnyOut`
`*Swap_ExactInAnyOut(...)`
### `*Swap_ExactInMinOut`
`*Swap_ExactInMinOut(...)`
### `*Swap_ExactInLimitPrice`
`*Swap_ExactInLimitPrice(...)`
### `*Swap_MaxInAnyOut`
`*Swap_MaxInAnyOut(...)`
### `*Swap_MaxInExactOut`
`*Swap_MaxInExactOut(...)`
### `*Swap_LimitPriceExactOut`
`*Swap_LimitPriceExactOut(...)`
### `*Swap_MaxInMinOutLimitPrice`
`*Swap_MaxInMinOutLimitPrice(...)`


### `isPoolOpen`
`isPoolOpen() returns (bool)`
### `getJoinPoolAmounts`
`getJoinPoolAmounts`
### `getExitPoolAmounts`
`getExitPoolAmounts`
### `joinPool`
`joinPool(uint ptoken_amt_in)`
### `exitPool`
`exitPool(uint ptoken_amt_out)`


### `start`
`start()`

Starts the pool, enabling `swap` variants. Requires at least 2 bound tokens.

### `pause`
`pause()`

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


