<p align=center>
<img width="128px" src="https://balancer-labs.github.io/pebbles/images/pebbles-pad.256w.png" alt="balancer pebbles logo"/>
</p>

<h1 align=center><code>balancer</code></h1>

**Balancer** is an automated **portfolio manager**, **liquidity provider**, and **price sensor**.

Balancer turns the concept of an index fund on its head: instead of a paying fees
to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance
your portfolio by following arbitrage opportunities.

Balancer is based on an N-dimensional invariant surface which is a generalization of the constant product formula described by Vitalik Buterin and proven viable by the popular Uniswap dapp.

<h2 align=center><br/><code>🍂 bronze release 🍂</code></h2>

The *🍂Bronze Release🍂*  is the first of 3 planned releases of the Balancer Protocol. Bronze emphasizes code clarity for audit and verification, and does not go to great lengths to optimize for gas.

The *❄️Silver Release❄️* will bring many gas optimizations and architecture changes that will reduce transaction overhead and enable more flexibility for managed pools.

The *☀️Golden Release☀️* will introduce a curious new liquidity mechanism to the market.


### Using the ABI definitions

Most users will want to consume the ABI definitions for BFactory and BPool.

This project follows the standard Truffle project structure. 

```
yarn build  # build artifacts to `build/contracts`
yarn tets   # run the tests
```

Some test cases give helpful example logs:

```
  Contract: math tests from canonical setup
pool := factory.newBPool()
dirt := tokens.build('DIRT')
rock := tokens.build('ROCK')
dirt.mint(MAX);
dirt.approve(POOL, MAX);
rock.mint(MAX);
rock.approve(POOL, MAX);
pool.bind(DIRT, 10000000000000000000, 1100000000000000000)
pool.bind(ROCK, 50000000000000000000, 2400000000000000000)
pool.setPublicSwap(true);
pool.setPublicJoin(true);
pool.rebind(DIRT, 10000000000000000000, 1100000000000000000)
pool.rebind(ROCK, 50000000000000000000, 2400000000000000000)
pool.swap_ExactAmountIn(DIRT, 2500000000000000000, ROCK, 0, MAX);
 -> ( 4860897990289925450 , 604192951531479606 )
    ✓ swap_ExactAmountIn (336ms)
```

Complete API docs are available at [https://balancer.finance/api](https://balancer.finance/api)
(or see the [markdown source](https://github.com/balancer-labs/balancer-finance/blob/master/api.md) if it's not available).
Look in the [`test/`](https://github.com/balancer-labs/balancer-core/tree/master/test) directory for working examples in a mock environment.

<p align=center>⊙</p>
