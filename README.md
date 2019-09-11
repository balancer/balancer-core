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


# Installing

Most users will want to consume the ABI definitions for `BFactory` and `BPool`.

At the moment, you can use the package as a git submodule.

```
git submodule add https://github.com/balancer-labs/balancer-core
```

Now you can require the package:

```javascript
let bcore = require('./balancer-core');
```

# Using

### Quickstart

```javascript
let bcore = require('./balancer-core')
let BFactory = bcore.types.BFactory
let BPool = bcore.types.BPool

let factory = new web3.eth.Contract(BFactory.abi).deploy(BFactory.bin)
let poolAddress = factory.newBPool()
let bpool = web3.eth.Contract(BPool.abi).at(poolAddress)

// Acoin and Bcoin are ERC20 tokens from somewhere else
Acoin.approve(poolAddress, toTwosComplement(-1))
Bcoin.approve(poolAddress, toTwosComplement(-1))

// token, initial balance, denormalized weight
bpool.bind(Acoin._address, toWei('200'), toWei('1'))
bpool.bind(BCoin._address, toWei('100'), toWei('2'))
bpool.start()
```

For more information [check out our work in progress docs](https://github.com/balancer-labs/balancer-page/blob/master/api.md)

# Developing (working on `balancer-core`)

```sh
# To develop you need `yarn`, `node`, and `solc`
brew install node yarn ethereum

# Clone the repo
git clone https://github.com/balancer-labs/balancer-core
cd balancer-core

yarn            # install dev dependencies
# yarn build    # compile the solidity contracts to tmp/  (`make`)
yarn test       # build contracts and run the tests (`make && mocha`)
yarn dist       # cp artifacts to out/ for commit (`make dist`)
                # and also runs `npx standard util/*`
```

### Project structure

```
out/            solidity build artifacts
    tmp/        .gitignore'd transient build out for tests
sol/            solidity source files (the contracts)
test/           tests for sol/ and util/
util/           javascript support code
LICENSE         GPL3
Makefile        solidity build command defined here
pkg.js          package entrypoint (module.exports)
package.json
yarn.lock
```

<p align=center>⊙</p>
