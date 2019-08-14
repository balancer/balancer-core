```
git submodule update --init --recursive
npm install

make # builds the contracts
npm test
```

terminology
```
Ti/To: token (address) in/out
Ai/Ao: amount of tokens in/out (amount specified for one trade)
Bi/Bo: total balance of token in a pool
Wi/Wo: weight of token in pool
Li/Lo: token limit in/out for trade (upper bound for Li, lower bound for Lo)

Pool:
    swapExactInLimitOut(Ti, Ai, To, Lo) returns (Ao)
    swapLimitInExactOut(Ti, Li, To, Ao) returns (Ai)

    setFee(T, f)
    setParams(T, B, W)
    bind(T) / unbind(T)
    pause() / start()
    clean(T)

Math:
    swapImath( Bi, Wi, Bo, Wo
             , Ai, feeRatio )
        public pure
        returns ( Ao );

    swapOmath( Bi, Wi, Bo, Wo
             , Ao, feeRatio )
        public pure
        returns ( Ai );

    spotPrice( Bi, Wi, Bo, Wo );
    
    spotPriceChangeMath( Bi, Wi, Bo, Wo, SER1, fee)
        public pure
        returns ( Ai );
```
