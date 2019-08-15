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
    byte    err:   error


// shortlist:
    _ExactIn_AnyOut(Ti, Ai, To) returns (Ao, err)
    _ExactIn_MinOut(Ti, Ai, To, Lo) returns (Ao, err)
    _ExactIn_MaxPrice(Ti, To, Ai, P) returns (Ao, err)

    _AnyIn_ExactOut(Ti, To, Ao) returns (Ai, err)
    _MaxIn_ExactOut(Ti, Li, To, Ao) returns (Ai, err)
    _ExactOut_MinPrice(Ti, To, Ao, P) returns (Ai, err)

    _MaxIn_MinOut_ToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)

// variants:
BPool
    view_spotPrice(Ti, To)
    view_refPrice(T)
    view refValue()

    viewSwap_ExactInAnyOut(Ti, Ai, To) returns (Ao, err)
    trySwap_ExactInAnyOut(Ti, Ai, To) returns (Ao, err)
    doSwap_ExactInAnyOut(Ti, Ai, To) returns (Ao)

    viewSwap_AnyInExactOut(Ti, To, Ao) returns (Ai, err)
    trySwap_AnyInExactOut(Ti, To, Ao) returns (Ai, err)
    doSwap_AnyInExactOut(Ti, To, Ao) returns (Ai)

    viewSwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao, err)
    trySwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao, err)
    doSwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao)

    viewSwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai, err)
    trySwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai, err)
    doSwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai)

    viewSwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao, err)
    trySwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao, err)
    doSwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao)

    viewSwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai, err)
    trySwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai, err)
    doSwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai)

    viewSwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)
    trySwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)
    doSwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao)

BMath
    math_spotPrice(Bi, Wi, Bo, Wo) returns (P, err);
    math_ExactIn(Bi, Wi, Bo, Wo, Ai, f) returns (Ao, err);
    math_ExactOut(Bi, Wi, Bo, Wo, Ao, f) returns (Ai, err);
    math_AmountUpToPrice(Bi, Wi, Bo, Wo, P) returns (Ai, Ao, err)



    setFee(T, f)
    setParams(T, B, W)
    setWeightFixRatio(T, W) returns (B)
    setBalanceFixRatio(T, B) returns (W)
    clean(T)
    bind(T)
    unbind(T)
    pause()
    start()
```
