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
    swapI(Ti, Ai, To) returns (toutAmount)

    // swap nolimit-in specify-OUT
    swapO(Ti, To, Ao) returns (tinAmount)

    // swap specify-IN, limit-out
    swapSILO(Ti, Ai, To, Lo) returns (toutAmount)

    // swap limit-in, specify-OUT
    swapLISO(Ti, Li, To, Ao) returns (tinAmount)

    setFee
    setParams
    bind/unbind
    pause/start
    sweep

Math:
    swapImath( Bi, Wi, Bo, Wo
             , Ai, feeRatio )
        public pure
        returns ( Ao );

    swapOmath( Bi, Wi, Bo, Wo
             , Ao, feeRatio )
        public pure
        returns ( Ai );

    ratio( Bi, Wi, Bo, Wo );
```
