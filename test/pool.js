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

describe("manager and pooling", async () => {
    let env = {};
    let accts;
    let admin;
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        admin = accts[0];
        env = await scene.phase2(web3, admin);
        env.accts = accts;
        env.admin = admin;
    });

    it("join/exit", async () => {
        let ABalBefore = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalBefore = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyBefore = await env.bpool.methods.getPoolTokenSupply().call();

        await env.bpool.methods.joinPool(web3.utils.toWei('1.0'))
                       .send({from: env.admin});
        let ABalMiddle = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalMiddle = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyMiddle = await env.bpool.methods.getPoolTokenSupply().call();

        await env.bpool.methods.exitPool(web3.utils.toWei('1.0'))
                       .send({from: env.admin});

        let ABalAfter = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalAfter = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyAfter = await env.bpool.methods.getPoolTokenSupply().call();
    });

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

    for( pt of testPoints.MaxInMinOutLimitPricePoints ) {
        let Bi  = toWei(pt.Bi.toString());
        let Lp  = toWei(pt.Lp.toString());
        let Li  = toWei(pt.Li.toString());
        let Lo  = toWei(pt.Lo.toString());
        let Wi  = toWei(pt.Wi.toString());
        let Bo  = toWei(pt.Bo.toString());
        let Wo  = toWei(pt.Wo.toString());
        let fee = toWei(pt.fee.toString());
        let expected = [toWei(pt.res[0].toString()), toWei(pt.res[1].toString())];
        it(`${pt.res} ~= bpool.doSwap_MaxInMinOutLimitPricePoints(${pt.Bi},${pt.Wi},${Li},${pt.Bo},${pt.Wo},${pt.Ao},${Lo},${pt.Lp},${pt.fee}>`, async () => {
            await bpool.methods.setParams(acoin._address, Wi, Bi).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(bcoin._address, Wo, Bo).send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setParams(ccoin._address, toWei('0.5'), toWei('10')) // shouldn't impact calc
                               .send({from: acct0, gas: 0xffffffff});
            await bpool.methods.setFee(fee).send({from: acct0, gas: 0xffffffff});
            var abefore = await acoin.methods.balanceOf(acct0).call();
            var bbefore = await bcoin.methods.balanceOf(acct0).call();
            var resultStatic = await bpool.methods.doSwap_MaxInMinOutLimitPrice(acoin._address, Li, bcoin._address, Lo, Lp)
                                                  .call();
            var result = await bpool.methods.doSwap_MaxInMinOutLimitPrice(acoin._address, Li, bcoin._address, Lo, Lp)
                                            .send({from: acct0, gas: 0xffffffff});
            var aafter = await acoin.methods.balanceOf(acct0).call();
            var bafter = await bcoin.methods.balanceOf(acct0).call();
            var adiff = toBN(abefore).sub(toBN(aafter));
            var bdiff = toBN(bafter).sub(toBN(bbefore));
            assert.equal(adiff, resultStatic["0"]);
            assert.equal(bdiff, resultStatic["1"]);
            assertCloseBN(expected[0], resultStatic["0"], approxTolerance.toString());
            assertCloseBN(expected[1], resultStatic["1"], approxTolerance.toString());
        });
    }



});


