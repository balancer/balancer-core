```
git submodule update --init --recursive
yarn install

make # builds the contracts
yarn test
```
interface
```
arguments / state:
    Ti/To: token (address) in/out
    Ai/Ao: amount (wei) of tokens in/out (amount specified for one trade)
    Bi/Bo: total balance (wei) of token in a pool
    Wi/Wo: weight of token in pool (as wei, i.e. 1.5 = 15*10**17)
    Li/Lo: token limit in/out (wei) for trade (upper bound for Li, lower bound for Lo)


// function shortlist:
    alias: ExactIn(Ti, Ai, To) returns (Ao, bool)
    ExactIn_AnyOut(Ti, Ai, To) returns (Ao, bool)
    ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, bool)

    alias: ExactOut(Ti, To, Ao) returns (Ai, bool)
    AnyIn_ExactOut(Ti, To, Ao) returns (Ai, bool)
    MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, bool)

    alias: ToPrice
    MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, bool)

// actual definitions:
BPool
    math_spotPrice(Bi, Wi, Bo, Wo) returns (P, bool);
    math_ExactIn(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, bool);
    math_ExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, bool);
    math_AmountUpToPrice(Bi, Wi, Bo, Wo, P) returns (Ai, Ao, bool)

    view_spotPrice(Ti, To)

    view_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao, bool)
    try_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao, bool)
    do_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao)
    do_swap_ExactIn(Ti, Ai, To) returns (Ao) // alias

    view_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai, bool)
    try_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai, bool)
    do_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai)
    do_swap_ExactOut(Ti, To, Ao) returns (Ai) // alias

    view_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    try_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    do_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao)

    view_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    try_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    do_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai)

    view_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, bool)
    try_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, bool)
    do_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao)

    view_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, bool)
    try_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, bool)
    do_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai)

    view_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, bool)
    try_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, bool)
    do_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao)
    do_swap_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao) // alias


    setFee(T, f)
    setParams(T, B, W)
    clean(T)
    bind(T)
    unbind(T)
    pause()
    start()
```
