let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../pkg.js");
pkg.types.loadTypes("../tmp/combined.json");
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
let MAX256 = web3.utils.toTwosComplement('-1');

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}

describe("crusty bpool tests", () => {
    var factory;
    var accts;
    var acct0; var acct1; var acct2;
    var bpool;
    var acoin; var bcoin; var ccoin;

    // balance of acct0 (for each coin) at start of each test
    let preBindBalance = toWei("1001"); // +1 for initial bind
    let initBalance = toWei("1000");

    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        acct0 = accts[0];
        acct1 = accts[1];
        acct2 = accts[2];

        acoin = await pkg.deploy(web3, acct0, "TToken", [asciiToHex("A")]);
        bcoin = await pkg.deploy(web3, acct0, "TToken", [asciiToHex("B")]);
        ccoin = await pkg.deploy(web3, acct0, "TToken", [asciiToHex("C")]);

        factory = await pkg.deploy(web3, acct0, "BFactory");

        //== TODO clean
        bpool = await factory.methods.newBPool().call();
        //console.log(bpool);
        await factory.methods.newBPool().send({from: acct0, gas:0xffffffff});
        //console.log(pkg.types.types.BPool);
        bpool = new web3.eth.Contract(JSON.parse(pkg.types.types.BPool.abi), bpool);
        //console.log(bpool);
        //--

        for (coin of [acoin, bcoin, ccoin]) {
            await coin.methods.mint(preBindBalance).send({from: acct0});
            for (user of [acct0, acct1, acct2] ) {
                await coin.methods.approve(bpool._address, MAX256)
                          .send({from: user});
            }
            await bpool.methods.bind(coin._address, toWei('1'), toWei('1')).send({from: acct0, gas:0xffffffff});
        }
        await bpool.methods.start().send({from: acct0});
    });

    for( pt of testPoints.calc_InGivenOutPoints ) {
        let expected  = toWei(pt.res.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let Ao  = toWei(pt.Ao.toString());
        it(`${pt.res} ~= bpool.doSwap_MaxInExactOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.res},${pt.fee})`, async () => {
            await bpool.methods.setParams(acoin._address, Bi, Wi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Bo, Wo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_MaxInExactOut(acoin._address, MAX256, bcoin._address, Ao)
                                                  .call();
            var result = await bpool.methods.doSwap_MaxInExactOut(acoin._address, MAX256, bcoin._address, Ao)
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

    for( pt of testPoints.StopOutGivenInPoints ) {
        let Ai  = toWei(pt.Ai.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let Lo  = toWei(pt.Lo.toString());
        let fee = toWei(pt.fee.toString());
        let expected = toWei(pt.res.toString());
        it(`${pt.res} ~= bpool.doSwap_ExactInMinOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ai},${pt.Lo},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Bi, Wi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Bo, Wo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_ExactInMinOut(acoin._address, Ai, bcoin._address, Lo)
                                                  .call();
            var result = await bpool.methods.doSwap_ExactInMinOut(acoin._address, Ai, bcoin._address, Lo)
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

    for( pt of testPoints.MaxInExactOutPoints ) {
        let Ao  = toWei(pt.Ao.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Li  = toWei(pt.Li.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let expected = toWei(pt.res.toString());
        it(`${pt.res} ~= bpool.doSwap_MaxInExactOut(${pt.Bi},${pt.Wi},${pt.Li},${pt.Bo},${pt.Wo},${pt.Ao},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Bi, Wi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Bo, Wo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_MaxInExactOut(acoin._address, MAX256, bcoin._address, Ao)
                                                  .call();
            var result = await bpool.methods.doSwap_MaxInExactOut(acoin._address, MAX256, bcoin._address, Ao)
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
        let aBalBefore = await bpool.methods.getBalance(acoin._address).call();
        assert.equal(aBalBefore, toWei('1'));
        await bpool.methods.setParams(acoin._address, ABalance, AWeight)
                           .send({from: acct0, gas: 0xffffffff});
        let aweight = await bpool.methods.getWeight(acoin._address).call();
        let abalance = await bpool.methods.getBalance(acoin._address).call();
        assert.equal(AWeight, aweight, 'wrong weight after setting');
        assert.equal(ABalance, abalance, 'wrong balance after setting');
        assert.equal(ABalance, (await acoin.methods.balanceOf(bpool._address).call()), 'wrong bpool acoin balance');
        assert.equal(preBindBalance - ABalance,
                    (await acoin.methods.balanceOf(acct0).call()), 'wrong initBalance - ABalanceBound');
    });
});
