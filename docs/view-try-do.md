Each of the `Swap` base functions comes in 3 variants:

* `viewSwap_*(...) view returns (uint256 result, bytes32 errcode)`
* `trySwap_*(...) returns (uint256, bytes32 errcode)`
* `doSwap_*(...) returns (uint256)`

Variation | Modifies the state on success | Returns error code on failure
-|-|-
`viewSwap_` | False❌ | True✅
`trySwap_` | True✅ | True✅
`doSwap_` | True✅ | False❌

These variations exist to give developers as much flexibility in writing contracts that interact with Balancer pools autonomously. They are structed this way in part because of the limited revert-oriented control flow that Solidity offers.
