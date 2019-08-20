Each of the `Swap` base functions comes in 3 variants:

* `viewSwap_*(...) view returns (uint256 result, bytes32 errcode)`
* `trySwap_*(...) returns (uint256, bytes32 errcode)`
* `doSwap_*(...) returns (uint256)`

Variation | Modifies the state | Returns error code
-|-|-
`viewSwap_` | False❌ | True✅
`trySwap_` | True✅ | True✅
`doSwap*_` | True✅ | False❌

These variations exist largely because of the limited error handling and limited revert-oriented control flow that Solidity offers.
