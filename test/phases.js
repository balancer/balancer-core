let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;

let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");

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
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        admin = accts[0];
    });
    it("phase0 postconditions", async () => {
        env = await scene.phase0(web3, admin);

        assert.exists(env.admin);
        assert.exists(env.factory);
    });
    it("phase1 postconditions", async () => {
        env = await scene.phase1(web3, admin);

        assert.exists(env.bpool, "bpool");
        let poolBuiltHere = await env.factory.methods.wasBPoolBuiltHere(env.bpool._address).call();
        assert(poolBuiltHere, "factory doesn't remember building bpool");
        let tokenBuiltHere = await env.factory.methods.wasBTokenBuiltHere(env.poolcoin._address).call();
        assert(tokenBuiltHere, "factory doesn't remember building poolcoin");

        assert.exists(env.acoin);
        assert.exists(env.bcoin);
        assert.exists(env.ccoin);

        let max = web3.utils.toBN(web3.utils.toTwosComplement('-1'));
        let abal = await env.acoin.methods.balanceOf(admin).call();
        let bbal = await env.bcoin.methods.balanceOf(admin).call();
        let cbal = await env.ccoin.methods.balanceOf(admin).call();

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
});
