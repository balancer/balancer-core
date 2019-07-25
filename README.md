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
    swapSpecifyIn(tinAmount, tin, tout) returns (toutAmount)
    swapSpecifyOut(tin, tout, toutAmount) returns (tinAmount)
    swapInExactOutLimit(tinAmount, tin, tout, toutLimit) returns (toutAmount)
    swapInLimitOutExact(tinLimit, tin, tout, toutAmount) returns (tinAmount)
Math:
    estimateInFor(tinBalance, toutBalance, fee, tin, tout, toutAmount);
    estimateOutFor(tinBalance, toutBalance, fee, tinAmount, tin, tout);

    swapSpecifyInMath( tinBalance, tinWeight,
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

function swapSpecifyInMath(
    Num tinBalance, Num tinWeight
  , Num toutBalance, Num toutWeight
  , Num tinAmount
  , Num fee
)
public pure
returns ( Num toutAmount, Num feeCollected);


(1, 0) ?= swapSpecifyInMath(1, 1, 1, 1, 0);

```
