<p align=center>
<img width="128px" src="https://balancer-labs.github.io/pebbles/images/pebbles-pad.256w.png" alt="balancer pebbles logo"/>
</p>

<h2 align=center><code>balancer</code></h2>

**Balancer** is an automated **portfolio manager**, **liquidity provider**, and **price sensor**.

Balancer turns the concept of an index fund on its head: instead of an investors paying fees
to portfolio managers to rebalance their portfolio, investors collect fees from traders who rebalance
the portfolio by following arbitrage opportunities.

<h2 align=center><br/><code>🍂 bronze release 🍂</code></h2>

The *🍂Bronze Release*  is the first of 3 planned releases of the Balancer Protocol.
Bronze emphasizes code clarity for audit and verification, and does not attempt to optimize for gas.
Bronze works directly with ERC20 tokens, inheriting all the warts associated with them.
The relative weights of tokens in a Bronze pool *cannot be changed once the pool is public*.
Balancer charges a per-pool exit fee for Bronze pools.

The *❄️Silver Release* will bring a number of gas optimizations and architecture changes that will reduce transaction overhead.
Many features that require wrapper contracts for Bronze will be possible directly in Silver pools in a cheaper and standardized way.
Balancer will charge a per-vault "unwrap" fee for Silver pools (in other words, an exit fee for the whole system).

The *☀️Golden Release* will introduce a curious new liquidity mechanism to the market.

## Installing

Most users will be interested in consuming ABI definitions for various Balancer contracts.

At the moment, the best way to use it is as a git submodule.

```
git submodule add https://github.com/balancer-labs/balancer-core
```

Now you can require the package:

```javascript
let bcore = require('./balancer-core');
let types = bcore.types; # A combined.json-like object with type names lifted

let Factory = bcore.types.BFactory;
let BPool = bcore.types.BPool;

let factory = new web3.eth.Contract(Factory.abi).deploy(Factory.bin);
let poolAddress = factory.newBPool();
let bpool = web3.eth.Contract(BPool.abi).at(poolAddress);

Acoin.approve(poolAddress, toTwosComplement(-1));
Bcoin.approve(poolAddress, toTwosComplement(-1));

bpool.bind(Acoin._address, toWei('200'), toWei('1'));
bpool.bind(BCoin._address, toWei('100'), toWei('2'));
bpool.start();
```

## API Docs

[Check out our work in progress docs](https://github.com/balancer-labs/balancer-page/blob/master/api.md)

## Developing (working on `balancer-core`)

```
# To develop you need `yarn`, `node`, and `solc`
brew install node yarn ethereum

# Clone the repo
git clone https://github.com/balancer-labs/balancer-core
cd balancer-core

yarn             # install dev dependencies
# yarn build     # compile the solidity contracts to tmp/  (`make`)
yarn test        # build contracts and run the tests (`make && mocha`)
yarn dist        # cp artifacts to out/ for commit (`make dist`)
                 # and also runs `npx standard util/*`
```

### Project structure

```
out/            solidity build artifacts
    tmp/        .gitignore'd transient build out for tests
sol/            solidity source files (the contracts)
test/           tests for util/ and sol/
util/           javascript support code
LICENSE         GPL3
Makefile        solidity build command defined here
pkg.js          package entrypoint (module.exports)
package.json
yarn.lock
```


