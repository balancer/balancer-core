let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let pkg = require("../package.js");
pkg.types.loadTypes("../tmp/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let scene = require("./scene.js");

describe("scene tests", async () => {
    let accts;
    let admin;
    let env = {};

    it("phase0 postconditions", async () => {
        env = await scene.phase0(web3, admin);

        assert.exists(env.admin);
        assert.exists(env.user1);
        assert.exists(env.user2);
        assert.exists(env.factory);
    });

    it("phase1 postconditions", async () => {
        env = await scene.phase1(web3, admin);

        assert.exists(env.bpool, "bpool");
        let poolBuiltHere = await env.factory.methods.wasBPoolBuiltHere(env.bpool._address).call();
        assert(poolBuiltHere, "factory doesn't remember building bpool");

        assert.exists(env.acoin);
        assert.exists(env.bcoin);
        assert.exists(env.ccoin);

        let max = web3.utils.toBN(web3.utils.toTwosComplement('-1'));
        let abal = await env.acoin.methods.balanceOf(env.admin).call();
        let bbal = await env.bcoin.methods.balanceOf(env.admin).call();
        let cbal = await env.ccoin.methods.balanceOf(env.admin).call();

        assert.equal(abal, max);
        assert.equal(bbal, max);
        assert.equal(cbal, max);
    });

    it("phase2 postconditions", async () => {
        env = await scene.phase2(web3, admin);
        let paused = await env.bpool.methods.isPaused().call();
        assert.isFalse(paused);
        for( let coin of [env.acoin, env.bcoin, env.ccoin] ) {
            let bal = await env.bpool.methods.getBalance(coin._address).call();
            let truebal = await coin.methods.balanceOf(env.bpool._address).call();
            assert.equal(bal, env.initBalance, "wrong bpool.getBalance(coin)");
            assert.equal(truebal, env.initBalance, "wrong coin.balanceOf(bpool)");
        }
    })

    it("phase3 postconditions", async () => {
        env = await scene.phase3(web3, admin);
        for( user of [env.user1, env.user2] ) {
            for( coin of [env.acoin, env.bcoin, env.ccoin] ) {
                let bal = await coin.methods.balanceOf(user).call();
                assert.equal(bal, env.initBalance);
                // DSToken MAX_U256 means infinite allowance
                let allowance = await coin.methods.allowance(user, env.bpool._address).call();
                let max = web3.utils.toBN(web3.utils.toTwosComplement("-1"));
                assert.equal(allowance, max);
            }
        }
    });
});
