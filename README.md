<p align=center>
<img src="https://balancer-labs.github.io/pebbles/png/pebbles-pad.064w.png" alt="balancer pebbles logo"/>
</p>

<h2 align=center><code>balancer</code></h2>

<p align=center><i>Balancer is a trustless on-chain price feed, liquidity provider, and portfolio manager.</i></p>

<h2 align=center><br/><code>🍂 bronze release 🍂</code></h2>

The *Bronze Release* is the first of 3 planned releases of the Balancer Protocol. Bronze could be described as solid, but heavyweight.

## Installing

Most users will be interested in consuming ABI definitions for various Balancer contracts.

At the moment, the best way to use it is as a git submodule.

```
mkdir lib
git submodule add https://github.com/balancer-labs/balancer-core lib/balancer-core
```

Now you can require the package:

```javascript
let bcore = require('./lib/balancer-core');
let types = bcore.types;  # A combined.json object with type names lifted
let BPool = bcore.types.BPool;
let bpool = new web3.eth.Contract(BPool.abi);
```

## API Docs

[Check out our work in progress docs](https://github.com/balancer-labs/balancer-page/blob/master/index.md)

## Developing (working on `balancer-core`)

```
# To develop you need `yarn`, `node`, and `solc`
brew install node yarn ethereum

# Clone the repo
git clone https://github.com/balancer-labs/balancer-core
cd balancer-core

# Get the dependencies
yarn setup       # clone submodules and install packages

# Dev loop
# yarn build       # compile the solidity contracts to tmp/  (`make build`)
yarn test        # build contracts and run the tests (`yarn build && mocha`)
yarn dist        # cp artifacts to out/ for commit (`make dist`)
```

### Project structure

```
docs/           markdown docs
lib/            solidity dependencies
out/            solidity build artifacts
sol/            solidity source files (the contracts)
test/           tests for util/ and sol/
tmp/            .gitignore'd transient build out
util/           javascript support code
LICENSE         GPL3
Makefile        solidity build command defined here
package.js      package entrypoint (module.exports)
package.json
yarn.lock
```

