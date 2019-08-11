let assert = require("assert");
let Web3 = require("web3");
let ganache = require("ganache-core");

let deployer = require("../src/deployer.js")

let buildout = require("../out/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true
}));

let bn = (num) => { return web3.utils.toBN(num); }

var env = { // Base scenario universe
    acct0: undefined,
    math: undefined,
    bTest: undefined,
};

beforeEach(async () => {
    env = await deployer.deployTestEnv(web3, buildout);
});

describe("balanceMath", function() {
    it("bOne is toWei(1)", async () => {
        let M = env.math;
        var bOne = await M.methods.bOne().call();
        var one = web3.utils.toWei("1");
        assert.equal(bOne, one);
    });
    it("bAdd, bMul", async function () {
        let M = env.math;
        var one = await M.methods.bOne().call();
        var two = await M.methods.bAdd(one, one).call();
        var fourAdd = await M.methods.bAdd(two, two).call();
        var fourMul = await M.methods.bMul(two, two).call();
        assert.equal(fourAdd, fourMul);
        
    }); 
    it("bMath.spotPrice(1, 1, 1, 1)", async function() {
        let M = env.math;
        let one = await M.methods.bOne().call();
        var res = await M.methods.spotPrice(one, one, one, one).call();
        assert.equal(one, res);
    });
    it("swapIMath", async function() {
        let M = env.math;
        var res = await M.methods.swapImath( 1, 1
                                           , 1, 1
                                           , 1, 0).call();
        assert.equal(res.toutAmount, 1, "wrong amount");
    });
});

describe("test contracts", () => {
    it("`run`", async () => {
        var t = env.bTest;
        await t.methods.run().send({from: env.acct0, gasLimit: 0xffffffff});
        var fails = await t.getPastEvents('Fail');
        if( fails.length != 0 ) {
            for (fail of fails) {
                // TODO: show 3 failures
                throw new Error(`Balancer.want: ${fail.returnValues.reason}`);
            }
        }
    });
});
