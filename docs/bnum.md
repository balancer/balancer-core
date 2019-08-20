`BNum`: Balancer Numeric Type
---

A `bnum` is a `uint256` that represents a fixed-point decimal with 10^18 precision.

It is directly inspired by the `wad` type from [`DSMath`](https://github.com/dapphub/ds-math). Due to a few subtle differences related to its use for Balancer, it has been defined as a distinct type to avoid mixing the two carelessly.
