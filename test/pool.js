let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");
let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let testPoints = require("./points.js");

let toWei = web3.utils.toWei;
let toBN = web3.utils.toBN;
let toHex = web3.utils.toHex;
let asciiToHex = web3.utils.asciiToHex;

let approxTolerance = 10 ** -6;
let floatEqTolerance = 10 ** -12;

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}

describe("BPool", () => {
    var accts;
    var acct0; var acct1; var acct2;
    var bpool;
    var acoin; var bcoin; var ccoin;

    // balance of acct0 (for each coin) at start of each test
    let initBalance = toWei("1000");

    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        acct0 = accts[0];
        acct1 = accts[1];
        acct2 = accts[2];

        acoin = await pkg.types.deploy(web3, acct0, "TToken", [asciiToHex("A")]);
        bcoin = await pkg.types.deploy(web3, acct0, "TToken", [asciiToHex("B")]);
        ccoin = await pkg.types.deploy(web3, acct0, "TToken", [asciiToHex("C")]);

        bpool = await pkg.types.deploy(web3, acct0, "BPool");
        for (coin of [acoin, bcoin, ccoin]) {
            await bpool.methods.bind(coin._address, toWei('1'), toWei('1')).send({from: acct0, gas:0xffffffff});
            await coin.methods.mint(initBalance).send({from: acct0});

            let maxApproval = web3.utils.toTwosComplement('-1');
        }
        await bpool.methods.start().send({from: acct0});
    });
    it("pkg.deployTestScenario", async () => {
        let env = await pkg.types.deployTestScenario(web3);
        let bbefore = await env.bcoin.methods.balanceOf(env.admin).call();
        let result = await env.pool.methods
                              .viewSwap_ExactInAnyOut( env.acoin._address
                                                     , web3.utils.toWei('5')
                                                     , env.bcoin._address)
                              .call();
        await env.pool.methods
                 .doSwap_ExactInAnyOut( env.acoin._address
                                      , web3.utils.toWei('5')
                                      , env.bcoin._address)
                 .send({from: env.admin});
        let bafter = await env.bcoin.methods.balanceOf(env.admin).call();
        let diff = toBN(bafter).sub(toBN(bbefore));
        assert.equal(diff, result[0]);
    });
    for( pt of testPoints.calc_OutGivenInPoints ) {
        let Ai  = toWei(pt.Ai.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let expected = toWei(pt.res.toString());
        it(`${pt.res} ~= bpool.doSwap_ExactInAnyOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ai},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_ExactInAnyOut(acoin._address, Ai, bcoin._address)
                                                  .call();
            var result = await bpool.methods.doSwap_ExactInAnyOut(acoin._address, Ai, bcoin._address)
                                            .send({from: acct0, gas: 0xffffffff});
            var aafter = await acoin.methods.balanceOf(acct0).call();
            var bafter = await bcoin.methods.balanceOf(acct0).call();
            var adiff = toBN(abefore).sub(toBN(aafter));
            var bdiff = toBN(bafter).sub(toBN(bbefore));
            assert.equal(bdiff, resultStatic);
            assert.equal(adiff, Ai);
            assertCloseBN(expected, resultStatic, approxTolerance.toString());
        });
    }

    for( pt of testPoints.calc_InGivenOutPoints ) {
        let expected  = toWei(pt.res.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let Ao  = toWei(pt.Ao.toString());
        it(`${pt.res} ~= bpool.doSwap_ExactOutAnyIn(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.res},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_ExactOutAnyIn(acoin._address, bcoin._address, Ao)
                                                  .call();
            var result = await bpool.methods.doSwap_ExactOutAnyIn(acoin._address, bcoin._address, Ao)
                                            .send({from: acct0, gas: 0xffffffff});
            var aafter = await acoin.methods.balanceOf(acct0).call();
            var bafter = await bcoin.methods.balanceOf(acct0).call();
            var adiff = toBN(abefore).sub(toBN(aafter));
            var bdiff = toBN(bafter).sub(toBN(bbefore));
            assert.equal(adiff, resultStatic);
            assert.equal(bdiff, Ao);
            assertCloseBN(expected, resultStatic, approxTolerance.toString());
        });
    }

    
    it("setup sanity checks", async () => {
        let paused = await bpool.methods.isPaused().call();
        assert( ! paused, "pool not started (unpaused)");
        var bound = await bpool.methods.isBound(acoin._address).call();
        assert(bound, "acoin not bound");
        assert.equal(initBalance, (await acoin.methods.balanceOf(acct0).call()), "acoin wrong init balance");
        assert.equal(initBalance, (await bcoin.methods.balanceOf(acct0).call()), "bcoin wrong init balance");
        assert.equal(initBalance, (await ccoin.methods.balanceOf(acct0).call()), "ccoin wrong init balance");
    });
    it("bind/unbind no-revert cases", async() => {
        numBound = await bpool.methods.getNumTokens().call();
        assert.equal(3, numBound);
        await bpool.methods.unbind(acoin._address).send({from: acct0});
        numBound = await bpool.methods.getNumTokens().call();
        assert.equal(2, numBound);
    });
    it("can transfer tokens", async () => {
        var sent = toWei("10");
        await acoin.methods.transfer(acct1, sent)
                           .send({from:acct0});
        var bal = await acoin.methods.balanceOf(acct1)
                             .call();
        assert.equal(sent, bal);
    });
    it("setParams basics", async () => {
        let AWeight = toWei("1.5");
        let ABalance = toWei("100");
        let BWeight = toWei("2.5");
        let BBalance = toWei("50");
        await bpool.methods.setParams(acoin._address, AWeight, ABalance)
                           .send({from: acct0, gas: 0xffffffff});
        let aweight = await bpool.methods.getWeight(acoin._address).call();
        let abalance = await bpool.methods.getBalance(acoin._address).call();
        assert.equal(AWeight, aweight);
        assert.equal(ABalance, abalance);
        assert.equal(ABalance, (await acoin.methods.balanceOf(bpool._address).call()));
        assert.equal(initBalance - ABalance,
                    (await acoin.methods.balanceOf(acct0).call()));
    });
});
