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
    approxInFor(tinBalance, toutBalance, fee, tin, tout, toutAmount);
    approxOutFor(tinBalance, toutBalance, fee, tinAmount, tin, tout);

    swapInExactMath( tinBalance, tinWeight,
                   , toutBalance, toutWeight,
                   , fee
                   , tinAmount )
        public pure
        returns ( newTinBalance, newTinWeight,
                , newToutBalance, newToutWeight
                , feeCollected
                , toutAmount )
```


Plain-english test cases
```
pseudo-solidity, with exact decimal math type "Num"

function swapInExactMath(
    Num tinBalance, Num tinWeight
  , Num toutBalance, Num toutWeight
  , Num fee
)
public pure
returns ( Num toutMoved, Num feeCollected);


(1, 0) ?= swapInExactMath(1, 1, 1, 1, 0);

```
