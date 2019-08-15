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

BPool
    view_spotPrice(Ti, To)
    pure_spotPrice(Bi, Wi, Bo, Wo)

    pure_ExactIn(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, bool);
    pure_ExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, bool);

    view_swap_ExactIn_AnyOut
    try_swap_ExactIn_AnyOut
    do_swap_ExactIn_AnyOut(Ti, Ai, To)

    view_swap
    try_swap
    do_swap_AnyIn_ExactOut(Ti, To, Ao)


    view_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    try_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    do_swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao)

    view_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    try_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    do_swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai)


    view_swap_
    try_swap_
    do_swap_ExactIn_MaxPrice(Ti, To, Ai, P)

    view_swap_
    try_swap_
    do_swap_ExactOut_MinPrice(Ti, To, Ao, P)


    view_swap_
    try_swap_
    do_swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao)


    setFee(T, f)
    setParams(T, B, W)
    clean(T)
    bind(T)
    unbind(T)
    pause()
    start()
```
