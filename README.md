```
git submodule update --init --recursive
yarn install

make # builds the contracts
yarn test
```
interface
```
Ti/To: token (address) in/out
Ai/Ao: amount (wei) of tokens in/out (amount specified for one trade)
Bi/Bo: total balance (wei) of token in a pool
Wi/Wo: weight of token in pool (as wei, i.e. 1.5 = 15*10**17)
Li/Lo: token limit in/out (wei) for trade (upper bound for Li, lower bound for Lo)

BalancerPool.
    swapExactInLimitOut(Ti, Ai, To, Lo) returns (Ao)
    swapLimitInExactOut(Ti, Li, To, Ao) returns (Ai)

    try_swapExactInLimitOut(Ti, Ai, To, Lo) returns (Ao, bool)
    try_swapLimitInExactOut(Ti, Li, To, Ao) returns (Ai, bool)

    view_swapExactInLimitOut(Ti, Ai, To, Lo) returns (Ao, bool)
    view_swapLimitInExactOut(Ti, Li, To, Ao) returns (Ai, bool)

    math_ExactInDeriveOut(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, bool);
    math_DeriveInExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, bool);

    setFee(T, f)
    setParams(T, B, W)
    clean(T)
    bind(T)
    unbind(T)
    pause()
    start()
```
