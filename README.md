
<h1 align=center><code>balancer</code></h1>

## Installing

Until this package is shipped to a package registry, the best way to use it is as a git submodule.

```
mkdir lib
git submodule add https://github.com/balancer-labs/balancer-core lib/balancer-core
cd lib/balancer-core
yarn setup
```

Now you can `require('./lib/balancer-core')`

## Usage

[Check out our API coverage issue](https://github.com/balancer-labs/balancer-core/issues/24)

## Developing

```
yarn setup     # clones submodules and installs packages
yarn build     # compile the solidity contracts
yarn test      # yarn build && mocha
yarn dist      # cp artifacts to out/
yarn docs      # build doc/ to docs/
yarn docserv   # serve docsite from doc/
```

### Project structure

```
doc/          documentation sources
docs/         docs build output (GH static site hard coded)
lib/          solidity dependencies
out/          solidity build artifacts
sol/          solidity source files (the contracts)
test/         tests for util/ and sol/
tmp/          .gitignore'd transient build out
util/         javascript support code
LICENSE       GPL3
Makefile      solidity build command defined here
package.js    package entrypoint (module.exports)
package.json
yarn.lock
```

