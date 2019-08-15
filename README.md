```
git submodule update --init --recursive
yarn install

make # builds the contracts
yarn test
```
interface
```
arguments / state:
    address Ti/To: token (address) in/out
    uint256 Ai/Ao: amount (wei) of tokens in/out (amount specified for one trade)
    uint256 Bi/Bo: total balance (wei) of token in a pool
    uint256 Wi/Wo: weight of token in pool (as wei, i.e. 1.5 = 15*10**17)
    uint256 Li/Lo: token limit in/out (wei) for trade (upper bound for Li, lower bound for Lo)
    uint256 P:     price
    uint256 F:     fee
    byte  err:    error


// function shortlist:
    alias: ExactIn(Ti, Ai, To) returns (Ao, err)
    ExactIn_AnyOut(Ti, Ai, To) returns (Ao, err)
    ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, err)
    ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, err)

    alias: ExactOut(Ti, To, Ao) returns (Ai, err)
    AnyIn_ExactOut(Ti, To, Ao) returns (Ai, err)
    MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, err)
    ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, err)

    alias: ToPrice
    MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)

// actual definitions:
BPool
    math_spotPrice(Bi, Wi, Bo, Wo) returns (P, err);
    math_ExactIn(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, err);
    math_ExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, err);
    math_AmountUpToPrice(Bi, Wi, Bo, Wo, P) returns (Ai, Ao, err)

    view_spotPrice(Ti, To)

    view_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao, err)
    try_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao, err)
    do_swap_ExactIn_AnyOut(Ti, Ai, To) returns (Ao)
    do_swap_ExactIn(Ti, Ai, To) returns (Ao) // alias

    view_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai, err)
    try_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai, err)
    do_swap_AnyIn_ExactOut(Ti, To, Ao) returns (Ai)
    do_swap_ExactOut(Ti, To, Ao) returns (Ai) // alias

    view_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, err)
    try_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, err)
    do_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao)

    view_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, err)
    try_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, err)
    do_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai)

    view_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, err)
    try_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, err)
    do_swap_ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao)

    view_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, err)
    try_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, err)
    do_swap_ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai)

    view_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)
    try_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)
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
