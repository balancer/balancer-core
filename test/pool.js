let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../pkg.js");
let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let testPoints = require("./points.js");

describe("BalancerPool", () => {
    var accts;
    var acct0; var acct1; var acct2;
    var bpool;
    var acoin; var bcoin; var ccoin;

    // balance of acct0 (for each coin) at start of each test
    let initBalance = web3.utils.toWei("1000");

    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        acct0 = accts[0];
        acct1 = accts[1];
        acct2 = accts[2];

        acoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("A")]);
        bcoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("B")]);
        ccoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("C")]);

        bpool = await pkg.deploy(web3, acct0, "BalancerPool");

        for (coin of [acoin, bcoin, ccoin]) {
            await bpool.methods.bind(coin._address).send({from: acct0});
            await coin.methods.mint(initBalance).send({from: acct0});

            for (acct of [acct0, acct1, acct2]) {
                let maxApproval = web3.utils.toTwosComplement('-1');
                await coin.methods.approve(bpool._address, maxApproval)
                                  .send({from: acct});
            }
        }
    });
    for( pt of testPoints.swapImathPoints ) {
        let Ai = web3.utils.toWei(pt.Ai.toString());
        let Bi = web3.utils.toWei(pt.Bi.toString());
        let Wi = web3.utils.toWei(pt.Wi.toString());
        let Bo = web3.utils.toWei(pt.Bo.toString());
        let Wo = web3.utils.toWei(pt.Wo.toString());
        let expected = web3.utils.toWei(pt.res.toString());
        it(`${pt.res} ?= swapI<${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ai},${pt.fee}>`, async () => {
            let Ainit = initBalance;
            let Binit = initBalance;
            await bpool.methods.setParams(acoin._address, Wi, Bi);
            await bpool.methods.setParams(bcoin._address, Wo, Bo);
            var result = await bpool.methods.swapI(acoin._address, Ai, bcoin._address)
                                            .send({from: acct0, gas: 0xffffffff});
            assert.equal(expected, result);
        });
    }
    it("setup sanity check: acoin is bound", async () => {
        var bound = await bpool.methods.isBound(acoin._address).call();
        assert(bound);
    });
    it("setup sanity check: acct0 initBalance", async () => {
        assert.equal(initBalance, (await acoin.methods.balanceOf(acct0).call()));
        assert.equal(initBalance, (await bcoin.methods.balanceOf(acct0).call()));
        assert.equal(initBalance, (await ccoin.methods.balanceOf(acct0).call()));
    });
    it("setup sanity check: approvals", async () => {
        assert.equal(initBalance, (await coin.methods.balanceOf(acct0).call()));
        for (acct of [acct0, acct1, acct2]) {
            for (coin of [acoin, bcoin, ccoin]) {
                let max = web3.utils.toTwosComplement('-1');
                let res = await coin.methods.allowance(acct, bpool._address)
                                            .call()
                assert.equal(max, web3.utils.toHex(res));
            }
        }
    });
    it("can transfer tokens", async () => {
        var sent = web3.utils.toWei("10");
        await acoin.methods.transfer(acct1, sent)
                           .send({from:acct0});
        var bal = await acoin.methods.balanceOf(acct1)
                             .call();
        assert.equal(sent, bal);
    });
    it("setParams basics", async () => {
        let AWeight = web3.utils.toWei("1.5");
        let ABalance = web3.utils.toWei("100");
        let BWeight = web3.utils.toWei("2.5");
        let BBalance = web3.utils.toWei("50");
        await bpool.methods.setParams(acoin._address, AWeight, ABalance)
                           .send({from: acct0, gas: 0xffffffff});
        let arec = await bpool.methods.records(acoin._address).call();
        assert.equal(AWeight, arec.weight);
        assert.equal(ABalance, arec.balance);
        assert.equal(ABalance, (await acoin.methods.balanceOf(bpool._address).call()));
        assert.equal(initBalance - ABalance,
                    (await acoin.methods.balanceOf(acct0).call()));
    });
});
