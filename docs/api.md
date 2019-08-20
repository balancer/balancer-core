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

| Function | Release | Tests? 
|-|-|-|
[`getSpotPrice(address T) returns (uint)`](#getSpotPrice) | Bronze🍂 | ✅ |
[`*_ExactInAnyOut(address Ti, address To, uint Ai) -> (uint Ao)`](#swap_ExactInMinOut) | Bronze🍂| ✅ |
[`*_ExactInMinOut(address Ti, address To, uint Ai, uint Lo) -> (uint Ao)`](#swap_ExactInMinOut) | Bronze🍂| ✅ | 
[`*_ExactInLimitPrice(address Ti, address To, uint Ai, uint P) -> (uint Ao)`]() | Bronze🍂 |  |  
[`*_AnyInExactOut(address Ti, address To, uint Ao) -> (uint Ao)`](#swap_MaxInExactOut) | Bronze🍂| ✅ |  
[`*_MaxInExactOut(address Ti, address To, uint Li, uint Ao) -> (uint Ao)`](#swap_MaxInExactOut) | Bronze🍂| ✅ |  
[`*_LimitPriceExactOut(address Ti, address To, uint P, uint Ao) -> (uint Ao)`]() | Bronze🍂 |  |  
[`*_MaxInMinOutLimitPrice(address Ti, address To, uint Li, uint Lo) -> (uint Ai, uint Ao)`]() | Bronze🍂 |  |  
[`isPoolOpen() returns (bool)`](#isPoolOpen) | Bronze🍂
[`joinPool(uint Ai)`](#joinPool) | Bronze🍂
[`exitPool(uint Ao)`](#exitPool) | Bronze🍂
[`getJoinPoolAmounts(uint Ai) returns (uint[MAX_TOKENS])`](#getJoinPoolAmounts) | Bronze🍂
[`getExitPoolAmounts(uint Ao) returns (uint[MAX_TOKENS])`](#getExitPoolAmounts) | Bronze🍂
[`start()`](#start) | Bronze🍂
[`pause()`](#pause) | Bronze🍂
[`bind(address T, uint B, uint W)`](#bind) | Bronze🍂
[`unbind(address T)`](#unbind) | Bronze🍂
[`sweep(address T)`](#sweep) | Bronze🍂
[`setParams(address T, uint B, uint W)`](#setParams) | Bronze🍂
[`setFee(uint F)`](#setFee) | Bronze🍂
[`getBalance(address T) returns (uint)`](#getBalance) | Bronze🍂
[`getWeight(address T) returns (uint)`](#getWeight) | Bronze🍂
[`getTotalWeight() returns (uint)`](#getTotalWeight) | Bronze🍂

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


