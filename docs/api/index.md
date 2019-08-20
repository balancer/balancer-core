# Trader 

### swap variants

`viewSwap`, `trySwap`, and `doSwap` for each variant

| Function | Release | Tests? | Docs? |
|-|-|-|-|
| `*_ExactInAnyOut` | ❌| ✅|   |
| `*_ExactInMinOut` | Bronze🍁| ✅ |  |
| `*_AnyInExactOut` | ❌| ✅ |  |
| `*_MaxInExactOut` | Bronze🍂|  |  |
| `*_ExactInLimitPrice` | Silver👽 |  |  |
| `*_LimitPriceExactOut` | Silver🐦 |  |  |
| `*_MaxInMinOutLimitPrice` | Silver💿|  |  |
| `getSpotPrice` | Bronze🐻 | |

# Pooling

Function | Release | Tests? | Docs? |
-|-|-|-
`isPoolOpen() returns (bool)` | Bronze🐂
`getJoinPoolAmounts(uint ptoken_amt_out) returns (uint[MAX_TOKENS])` | Bronze🥉
`getExitPoolAmounts(uint ptoken_amt_in) returns (uint[MAX_TOKENS])` | Bronze🥉
`joinPool(uint ptoken_amt_in)` | Bronze🥉
`exitPool(uint ptoken_amt_out)` | Bronze🥉

# Manager 

Function | Release | Tests? | Docs? 
-|-|-|-
`start` | Bronze🥉
`pause` | Bronze🥉
`bind` | Bronze🥉
`unbind` | Bronze🥉
`sweep` | Bronze🥉
`setParams` | Bronze🥉
`setFee` | Bronze🥉
`getBalance` | Bronze🥉
`getWeight` | Bronze🥉
`getTotalWeight` | Bronze🥉
`getNormalizedWeight` | Bronze🥉
`setWeightAdjustBalance` | Silver🔗
`setBalanceAdjustWeight` | Silver🕊


