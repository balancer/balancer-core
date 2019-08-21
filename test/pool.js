let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../package.js");
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

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}

// accts[0] will be the admin
// any remaining accounts will get an initial balance and approve the bpool
// if accts is empty or undefined, getAccounts()[0,1,2] will be used
deployTestScenario = async function(web3, accts, log) {
    if (!log) log = () => {}
    var env = {};
    if (!accts || accts.length == 0) {
        accts = await web3.eth.getAccounts();
        accts = accts.slice(0, 3);
    }
    let admin = accts[0];

    env.accts = accts;
    env.admin = admin;

    env.factory = await pkg.deploy(web3, admin, "BFactory");
    log(`factory ${env.factory._address} = deploy BFactory`);

    let poolAddress = await env.factory.methods.newBPool().call();
    await env.factory.methods.newBPool().send({from: env.admin, gas: 0xffffffff});
    env.pool = new web3.eth.Contract(JSON.parse(pkg.types.types.BPool.abi), poolAddress);
    log(`pool ${env.pool._address} = factory.new_BPool()`);

    env.acoin = await pkg.deploy(web3, admin, "TToken", [web3.utils.toHex("A")]);
    log(`${env.acoin._address} = deploy TToken`);
    env.bcoin = await pkg.deploy(web3, admin, "TToken", [web3.utils.toHex("B")]);
    log(`${env.bcoin._address} = deploy TToken`);
    env.ccoin = await pkg.deploy(web3, admin, "TToken", [web3.utils.toHex("C")]);
    log(`${env.ccoin._address} = deploy TToken`);

    let toWei = web3.utils.toWei;

    for (let coin of [env.acoin, env.bcoin, env.ccoin]) {
        log(`for coin: ${coin._address}`);
        for (let acct of accts) {
            log(`  for acct: ${acct}`);
            let amt = toWei('10000');
            await coin.methods.mint(amt).send({from: admin});
            log(`    mint ${amt}`);
            await coin.methods.transfer(acct, amt).send({from: admin});
            log(`    xfer to ${acct}`);
            await coin.methods.approve(env.pool._address, web3.utils.toTwosComplement('-1'))
                      .send({from: acct});
            log(`    approve pool by ${acct}`);
        }
        await coin.methods.mint(toWei('100'));
        log(`  mint token for pool`);
        await env.pool.methods.bind(coin._address, toWei('1'), toWei('1'))
                      .send({from: admin, gas: 0xffffffff});
        log(`  bind token to pool...`);
        let balance = toWei('10');
        let weight = toWei('10');
        await env.pool.methods.setParams(coin._address, weight, balance)
                      .send({from: admin, gas: 0xffffffff});
        log(`  setting params: weight: ${weight} , balance: ${balance}`); 
    }

    await env.pool.methods.start().send({from: admin});
    log(`pool.start()`);
    
    return env;
}

describe("BPool", () => {
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
            await bpool.methods.bind(coin._address, toWei('1'), toWei('1')).send({from: acct0, gas:0xffffffff});

            let maxApproval = web3.utils.toTwosComplement('-1');
        }
        await bpool.methods.start().send({from: acct0});
    });
    it("deployTestScenario", async () => {
        let env = await deployTestScenario(web3);
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

    for( pt of testPoints.calc_InGivenOutPoints ) {
        let expected  = toWei(pt.res.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let Ao  = toWei(pt.Ao.toString());
        it(`${pt.res} ~= bpool.doSwap_AnyInExactOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.res},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_AnyInExactOut(acoin._address, bcoin._address, Ao)
                                                  .call();
            var result = await bpool.methods.doSwap_AnyInExactOut(acoin._address, bcoin._address, Ao)
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
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
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

    for( pt of testPoints.ExactInLimitPricePoints ) {
        let Ai  = toWei(pt.Ai.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let Lp  = toWei(pt.Lp.toString());
        let fee = toWei(pt.fee.toString());
        let expected = toWei(pt.res.toString());
        it(`${pt.res} ~= bpool.doSwap_ExactInLimitPrice(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ai},${pt.Lp},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_ExactInLimitPrice(acoin._address, Ai, bcoin._address, Lp)
                                                  .call();
            var result = await bpool.methods.doSwap_ExactInLimitPrice(acoin._address, Ai, bcoin._address, Lp)
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
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_MaxInExactOut(acoin._address, Li, bcoin._address, Ao)
                                                  .call();
            var result = await bpool.methods.doSwap_MaxInExactOut(acoin._address, Li, bcoin._address, Ao)
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

    for( pt of testPoints.LimitPriceInExactOutPoints ) {
        let Ao  = toWei(pt.Ao.toString());
        let Bi  = toWei(pt.Bi.toString());
        let Lp  = toWei(pt.Lp.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let expected = toWei(pt.res.toString());
        it(`${pt.res} ~= bpool.doSwap_LimitPriceInExactOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ao},${pt.Lp},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_LimitPriceInExactOut(acoin._address, bcoin._address, Ao, Lp)
                                                  .call();
            var result = await bpool.methods.doSwap_LimitPriceInExactOut(acoin._address, bcoin._address, Ao, Lp)
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
        await bpool.methods.setParams(acoin._address, AWeight, ABalance)
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
