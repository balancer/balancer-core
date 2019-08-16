
<h1 align=center><code>balancer</code></h1>

### Installing

Until this package is shipped to a package registry, the best way to use it is as a git submodule.

```
mkdir lib
git submodule add https://github.com/balancer-labs/balancer-core lib/balancer-core
cd lib/balancer-core
yarn setup
```

### Developing

```
yarn setup     # clones submodules and installs packages
yarn build     # compile the solidity contracts
yarn test      # yarn build && mocha
yarn dist      # cp artifacts to out/
```

### etc
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

// variants:
BPool
    swapEIAO(Ti, Ai, To) returns (Ao);
    doSwap_ExactInAnyOut(Ti, Ai, To) returns (Ao)
    trySwap_ExactInAnyOut(Ti, Ai, To) returns (Ao, err)
    viewSwap_ExactInAnyOut(Ti, Ai, To) returns (Ao, err)

    swapAIEO(Ti, To, Ao) returns (Ai)
    doSwap_AnyInExactOut(Ti, To, Ao) returns (Ai)
    trySwap_AnyInExactOut(Ti, To, Ao) returns (Ai, err)
    viewSwap_AnyInExactOut(Ti, To, Ao) returns (Ai, err)

    swapEIMO(Ti, Ai, To, Lo) returns (Ao)
    doSwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao)
    trySwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao, err)
    viewSwap_ExactInMinOut(Ti, Ai, To, Lo) returns (Ao, err)

    swapMIEO(Ti, Li, To, Ao) returns (Ai)
    doSwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai)
    trySwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai, err)
    viewSwap_MaxInExactOut(Ti, Li, To, Ao) returns (Ai, err)

    swapEIMP(Ti, To, Ai, P) returns (Ao)
    doSwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao)
    trySwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao, err)
    viewSwap_ExactInMaxPrice(Ti, To, Ai, P) returns (Ao, err)

    swapEOMP(Ti, To, Ao, P) returns (Ai)
    doSwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai)
    trySwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai, err)
    viewSwap_ExactOutMinPrice(Ti, To, Ao, P) returns (Ai, err)

    swapMMTP(Ti, Li, To, Lo, P) returns (Ai, Ao)
    doSwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao)
    trySwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)
    viewSwap_MaxIn_MinOutToPrice(Ti, Li, To, Lo, P) returns (Ai, Ao, err)

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
