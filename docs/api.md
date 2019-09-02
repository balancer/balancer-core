# API Index

Each `swap` functions comes in three variations: [`viewSwap*`, `trySwap*`, and `doSwap*`](view-try-do.md)

All `uint` (`uint256`) arguments are considered [`bnum`s](bnum.md).

Argument shorthand:
```
Ti := Token In
To := Token Out
Ai := Amount In
Ao := Amount Out
Li := Limit In (amount)
Lo := Limit Out (amount)
Bi := Balance of "in" token
Wi := Weight
LP := Limit Price
F  := Fee (as a percent, as a `bnum`)

Canonical order (parenthesis to help remember order by cluster):

(Ti, Bi, Wi, Ai, To, Bo, Wo, Ao, LP, F)

to help remember:

((Ti, (Bi, Wi)), Ai), ((To, (Bo, Wo)), Ao), LP, F
(token, amount), (token, amount), price, fee
```

| Function
|-
[`*_ExactInMinOut(TODO) -> (uint Ao)`](#swap_ExactInMinOut) | 
[`*_ExactInLimitPrice(TODO) -> (uint Ao)`]() | 
[`*_MaxInExactOut(TODO) -> (uint Ao)`](#swap_MaxInExactOut) | 
[`*_LimitPriceExactOut(TODO) -> (uint Ao)`]() | 
[`*_MaxInMinOutLimitPrice(TODO) -> (uint Ai, uint Ao)`]() | 
[`isJoinable() returns (bool)`](#isJoinable) | 
[`makeJoinable()`](#isJoinable) | 
[`joinPool(uint Ai)`](#joinPool) | 
[`exitPool(uint Ao)`](#exitPool) | 
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

### `*Swap_ExactInMinOut`
`*Swap_ExactInMinOut(...)`
### `*Swap_ExactInLimitPrice`
`*Swap_ExactInLimitPrice(...)`
### `*Swap_MaxInExactOut`
`*Swap_MaxInExactOut(...)`
### `*Swap_LimitPriceExactOut`
`*Swap_LimitPriceExactOut(...)`
### `*Swap_MaxInMinOutLimitPrice`
`*Swap_MaxInMinOutLimitPrice(...)`
### `getSpotPrice(address T) returns (uint)`
`getSpotPrice(address T) returns (uint)`


## Pooling API

### `isJoinable`
`isJoinable() returns (bool)`
### `makeJoinable`
`makeJoinable() returns (bool)`
### `joinPool`
`joinPool(uint ptoken_amt_in)`
### `exitPool`
`exitPool(uint ptoken_amt_out)`

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


