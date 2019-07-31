var assert = require("assert");
var Web3 = require("web3");
var ganache = require("ganache-core");

let buildout = require("../out/combined.json");
let types = buildout.contracts;
let Balancer = types["src/Balancer.sol:Balancer"];
let BalanceMath = types["src/BalanceMath.sol:BalanceMath"];
let BalanceMathConstant = types["src/BalanceMath.sol:BalanceMathConstant"];
let BalanceTest = types["src/BalanceTest.sol:BalanceTest"];


var web3 = new Web3(ganache.provider());
var objects = { // Base scenario universe
    acct0: undefined,
    math: undefined,
    bTest: undefined,
};

// TODO untangle spaghetti
beforeEach((done) => {
    // web3.js / ganache-core bug, hangs on .send().then()
    // Can be extracted manually
    async function deploy(type, cb) {
        //console.log(type);
        if(type.bin == '') {
            throw new Error("Trying to deploy contract with empty `bin`");
        }
        let accounts = await web3.eth.getAccounts();
        acct0 = accounts[0];
        new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin})
            .send({from: acct0, gas: 6000000}, (err,tx) => {
                //console.log(err, tx);
                setTimeout(() => {
                    web3.eth.getTransactionReceipt(tx, (err, receipt) => {
                        //console.log(err, receipt);
                        cb(receipt.contractAddress);
                    })
                }, 25);
            })
    }

    deploy(BalanceMath, (address) => {
        objects.math = new web3.eth.Contract(JSON.parse(BalanceMath.abi), address);
        deploy(BalanceTest, (address) => {
            objects.bTest = new web3.eth.Contract(JSON.parse(BalanceTest.abi), address);
            done();
        });
    });
});

describe("test scenario", () => {
    var RAY = web3.utils.toBN('1000000000000000000000000000');
    var WAD = web3.utils.toBN('1000000000000000000');
    let bn = (num) => { return web3.utils.toBN(num); }
    it("swapImath basic values", async() => {
        var M = objects.math;
        var res = await M.methods.swapImath(1, 1, 1, 1, 1, 1).call();
        assert.equal(res.toutAmount, 1, "wrong amount");
        assert.equal(res.feeAmount, 1, "wrong fee");
    });
    it("`run`", async () => {
        var t = objects.bTest;
        await t.methods.run().send({from: acct0});
        var fails = await t.getPastEvents('Fail');
        if( fails.length != 0 ) {
            for (fail of fails) {
                // TODO: show 3 failures
                throw new Error(`Balancer.want: ${fail.returnValues.reason}`);
            }
        }
    });
});
