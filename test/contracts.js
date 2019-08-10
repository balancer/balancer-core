let assert = require("assert");
let Web3 = require("web3");
let ganache = require("ganache-core");

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
        objects.acct0 = accounts[0];
        new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin})
            .send({from: objects.acct0, gas: 6000000}, (err,tx) => {
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

describe("balanceMath", function() {
    it("bAdd", async () => {
        let M = objects.math;
        var one = await M.methods.bOne().call();
        var two = await M.methods.bAdd(one, one).call();
        var fourAdd = await M.methods.bAdd(two, two).call();
        var fourMul = await M.methods.bMul(two, two).call();
        assert.equal(fourAdd, fourMul);
        
    }); 
    it("swapIMath", async function() {
        let M = objects.math;
        var res = await M.methods.swapImath( 1, 1
                                           , 1, 1
                                           , 1, 0).call();
        assert.equal(res.toutAmount, 1, "wrong amount");
    });
});

describe("test contracts", () => {
    it("`run`", async () => {
        var t = objects.bTest;
        await t.methods.run().send({from: objects.acct0, gasLimit: 0xffffffff});
        var fails = await t.getPastEvents('Fail');
        if( fails.length != 0 ) {
            for (fail of fails) {
                // TODO: show 3 failures
                throw new Error(`Balancer.want: ${fail.returnValues.reason}`);
            }
        }
    });
});
