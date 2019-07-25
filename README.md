```
git submodule update --init --recursive
make
npm test
```

terminology
```
tin: token in
tout: token out
tinBalance:  total amount of token in a pol
tinAmount: amount of tokens in for a particular operation
tinWeight: weight of token in pool
// similar for tout

Pool:
    swapInExact(tinAmount, tin, tout) returns (toutAmount)
    swapOutExact(tin, tout, toutAmount) returns (tinAmount)
    approxIn(tin, tout, toutAmount) returns (approxTinAmt)
    approxOut(tinAmount, tin, tout) returns (approxToutAmt)
    swapInExactOutLimit(tinAmount, tin, tout, toutLimit) returns (toutAmount)
    swapInLimitOutExact(tinLimit, tin, tout, toutAmount) returns (tinAmount)
Math:
```
