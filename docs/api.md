# API Index

Each `swap` functions comes in three variations: [`viewSwap*`, `trySwap*`, and `doSwap*`](view-try-do.md)

All `uint` (`uint256`) arguments are considered [`bnum`s].

Argument shorthand:
```
Ti := Token In
To := Token Out
Ai := Amount In
Ao := Amount Out
Li := Limit In
Lo := Limit Out
B  := Balance
W  := Weight
P  := Price (always "how Ti does one To cost") TODO or the opposite
F  := Fee (as a percent, as a `bnum`)
```

| Function
|-|-|-|
[`getSpotPrice(address T) returns (uint)`](#getSpotPrice) 
[`*_ExactInAnyOut(address Ti, address To, uint Ai) -> (uint Ao)`](#swap_ExactInMinOut)  |
[`*_ExactInMinOut(address Ti, address To, uint Ai, uint Lo) -> (uint Ao)`](#swap_ExactInMinOut) | 
[`*_ExactInLimitPrice(address Ti, address To, uint Ai, uint P) -> (uint Ao)`]() | 
[`*_AnyInExactOut(address Ti, address To, uint Ao) -> (uint Ao)`](#swap_MaxInExactOut) |
[`*_MaxInExactOut(address Ti, address To, uint Li, uint Ao) -> (uint Ao)`](#swap_MaxInExactOut) | 
[`*_LimitPriceExactOut(address Ti, address To, uint P, uint Ao) -> (uint Ao)`]() | 
[`*_MaxInMinOutLimitPrice(address Ti, address To, uint Li, uint Lo) -> (uint Ai, uint Ao)`]() | 
[`isPoolOpen() returns (bool)`](#isPoolOpen) | 
[`joinPool(uint Ai)`](#joinPool) | 
[`exitPool(uint Ao)`](#exitPool) | 
[`getJoinPoolAmounts(uint Ai) returns (uint[MAX_TOKENS])`](#getJoinPoolAmounts) | 
[`getExitPoolAmounts(uint Ao) returns (uint[MAX_TOKENS])`](#getExitPoolAmounts) | 
[`start()`](#start) | 
[`pause()`](#pause) | 
[`bind(address T, uint B, uint W)`](#bind) | 
[`unbind(address T)`](#unbind) | 
[`sweep(address T)`](#sweep) | 
[`setParams(address T, uint B, uint W)`](#setParams) | 
[`setFee(uint F)`](#setFee) | 
[`getBalance(address T) returns (uint)`](#getBalance) | 
[`getWeight(address T) returns (uint)`](#getWeight) | 
[`getTotalWeight() returns (uint)`](#getTotalWeight) | 

## Trader API

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
### `getSpotPrice(address T) returns (uint)`
`getSpotPrice(address T) returns (uint)`


## Pooling API

### `isPoolOpen`
`isPoolOpen() returns (bool)`
### `joinPool`
`joinPool(uint ptoken_amt_in)`
### `exitPool`
`exitPool(uint ptoken_amt_out)`
### `getJoinPoolAmounts`
`getJoinPoolAmounts`
### `getExitPoolAmounts`
`getExitPoolAmounts`

## Manager API

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


