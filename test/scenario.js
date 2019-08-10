let assert = require("assert");
let Web3 = require("web3");
let ganache = require("ganache-core");

let deployer = require("../src/deployer.js");
let buildout = require("../out/combined.json");
let types = buildout.contracts;
let Balancer = types["src/Balancer.sol:Balancer"];
let BalanceMath = types["src/BalanceMath.sol:BalanceMath"];
let BalanceTest = types["src/BalanceTest.sol:BalanceTest"];

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true
}));

let RAY = web3.utils.toBN('1000000000000000000000000000');
let WAD = web3.utils.toBN('1000000000000000000');
let bn = (num) => { return web3.utils.toBN(num); }


var environment = { // Base scenario universe
    acct0: undefined,
    math: undefined,
    bTest: undefined,
};

// TODO untangle spaghetti
beforeEach((done) => {
    // web3.js / ganache-core bug, hangs on .send().then()
    // Can be extracted manually
    web3.eth.getAccounts(function(err, accts) {
        environment.acct0 = accts[0];
    });
    deployer.deployType(web3, BalanceMath, (address) => {
        environment.math = new web3.eth.Contract(JSON.parse(BalanceMath.abi), address);
        deployer.deployType(web3, BalanceTest, (address) => {
            environment.bTest = new web3.eth.Contract(JSON.parse(BalanceTest.abi), address);
            done();
        });
    });
});

describe("balanceMath", function() {
    it("bAdd, bMul basics", async () => {
        let M = environment.math;
        var one = await M.methods.bOne().call();
        var two = await M.methods.bAdd(one, one).call();
        var fourAdd = await M.methods.bAdd(two, two).call();
        var fourMul = await M.methods.bMul(two, two).call();
        assert.equal(fourAdd, fourMul);
        
    }); 
    it("bAdd overflow should throw", async() => {
        throw new Error("unimplemented");
    });
    it("bMul overflow should throw", async() => {
        throw new Error("unimplemented");
    });
    it("bSub underflow should throw", async() => {
        throw new Error("unimplemented");
    });
    it("bDiv by 0 should throw", async() => {
        throw new Error("unimplemented");
    });
    it("bDiv MAXINT/-1 should throw", async() => {
        // TODO this is only relevant if we switch to signed ints
        throw new Error("unimplemented");
    });
    it("swapIMath", async function() {
        let M = environment.math;
        var res = await M.methods.swapImath( 1, 1
                                           , 1, 1
                                           , 1, 0).call();
        assert.equal(res.toutAmount, 1, "wrong amount");
    });
});

describe("test scenario", () => {
    it("`run`", async () => {
        var t = environment.bTest;
        await t.methods.run().send({from: environment.acct0, gasLimit: 0xffffffff});
        var fails = await t.getPastEvents('Fail');
        if( fails.length != 0 ) {
            for (fail of fails) {
                // TODO: show 3 failures
                throw new Error(`Balancer.want: ${fail.returnValues.reason}`);
            }
        }
    });
});
