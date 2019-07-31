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
    // swap specify-IN nolimit-out
    swapI(tinAmount, tin, tout) returns (toutAmount)

    // swap nolimit-in specify-OUT
    swapO(tin, tout, toutAmount) returns (tinAmount)

    // swap specify-IN, limit-out
    swapSILO(tinAmount, tin, toutAmount, tout) returns (toutAmount)

    // swap limit-in, specify-OUT
    swapLISO(tin, tinLimit, tout, toutAmount) returns (tinAmount)

Math:
    swapImath( tinBalance, tinWeight,
             , toutBalance, toutWeight,
             , feeRatio
             , tinAmount )
        public pure
        returns ( toutAmount, feeCollected );
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
