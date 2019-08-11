```
git submodule update --init --recursive
npm install

make # builds the contracts
npm test
```

terminology
```
Ti: token in
Bi: total balance of token in a pool
Ai: amount of tokens in (for one trade)
Wo: weight of token in pool

To, Bo, Ao, Wo: token/balance/amount/weight out

Pool:
    // swap specify-IN nolimit-out
    swapI(Ai, Ti, To) returns (toutAmount)

    // swap nolimit-in specify-OUT
    swapO(Ti, To, Ao) returns (tinAmount)

    // swap specify-IN, limit-out
    swapSILO(Ai, Ti, Lo, To) returns (toutAmount)

    // swap limit-in, specify-OUT
    swapLISO(Ti, Li, To, Ao) returns (tinAmount)

Math:
    swapImath( Bi, Wi, Bo, Wo
             , Ai, feeRatio )
        public pure
        returns ( Ao );

    ratio( Bi, Wi, Bo, Wo );
```




