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
    SSINL // no limit
    swapSpecifyOut(tin, tout, toutAmount) returns (tinAmount)
    SSONL // no limit
    swapSpecifyInLimitOut(tinAmount, tin, toutAmount, tout) returns (toutAmount)
    SSILO
    swapSpecifyOutLimitIn(tin, tinLimit, tout, toutAmount) returns (tinAmount)
    SSOLI
Math:
    swapSpecifyInMath( tinBalance, tinWeight,
                     , toutBalance, toutWeight,
                     , feeRatio
                     , tinAmount )
        public pure
        returns ( toutAmount, feeCollected );
    SSIM
    swapSpecifyOutMath(...)
    SSOM
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
