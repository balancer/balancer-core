```
git submodule update --init --recursive
yarn install

make # builds the contracts
yarn test
```
interface
```
roles:
    traders: users who call `swap` variants
    poolers: users who call `pool`/`unpool`
    manager: user or contract that calls "admin" and config functions

arguments / state:
    Ti/To: token (address) in/out
    Ai/Ao: amount (wei) of tokens in/out (amount specified for one trade)
    Bi/Bo: total balance (wei) of token in a pool
    Wi/Wo: weight of token in pool (as wei, i.e. 1.5 = 15*10**17)
    Li/Lo: token limit in/out (wei) for trade (upper bound for Li, lower bound for Lo)

BPool
  traders
    view_spotPrice(Ti, To)
    math_spotPrice(Bi, Wi, Bo, Wo)

    math_ExactIn(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, bool);
    math_ExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, bool);


    swap_ExactIn_AnyOut(Ti, Ai, To)
    swap_view_ExactIn_AnyOut
    swap_try_ExactIn_AnyOut

    swap_AnyIn_ExactOut(Ti, To, Ao)
    swap_view_
    swap_try_


    swap_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao)
    swap_view_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)
    swap_try_ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, bool)

    swap_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai)
    swap_view_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)
    swap_try_MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, bool)


    swap_ExactIn_MaxPrice(Ti, To, Ai, P)
    swap_view_
    swap_try_

    swap_ExactOut_MinPrice(Ti, To, Ao, P)
    swap_view_
    swap_try_


    swap_MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao)
    swap_view_
    swap_try_


  poolers

  manager
    setFee(T, f)
    setParams(T, B, W)
    clean(T)
    bind(T)
    unbind(T)
    pause()
    start()
```
