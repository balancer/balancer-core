Each of the `Swap` base functions comes in 3 variants: `viewSwap`, `trySwap`, and `doSwap`.

Variation | Modifies the state | Returns error code
-|-|-
`viewSwap*` | False | True
`trySwap*` | True | True
`doSwap*` | True | False

These variations exist largely because of the limited error handling and limited revert-oriented control flow that Solidity offers.
