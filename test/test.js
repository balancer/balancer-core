var assert = require("assert");
var Web3 = require("web3");
var ganache = require("ganache-core");

let buildout = require("../out/combined.json");
let types = buildout.contracts;
let Balancer = types["src/Balancer.sol:Balancer"];
let BalanceMath = types["src/BalanceMath.sol:BalanceMath"];


var web3 = new Web3(ganache.provider());
var objects = { // Base scenario universe
    math: undefined,
    tokenA: undefined,
};

beforeEach((done) => {
    // web3.js / ganache-core bug, hangs on .send().then()
    // Can be extracted manually
    function deploy(type, cb) {
        //console.log(type);
        web3.eth.getAccounts().then((accounts) => {
            let account = accounts[0];
            web3.eth.Contract(JSON.parse(type.abi))
                .deploy({data: type.bin})
                .send({from: account, gas: 6000000}, (err,tx) => {
       //             console.log(err, tx);
                    setTimeout(() => {web3.eth.getTransactionReceipt(tx, (err, receipt) => {
                        //console.log(err, receipt);
                        cb(receipt.contractAddress);
                    })}, 25);
                })
        })
    }

    deploy(BalanceMath, async (address) => {
        objects.math = await web3.eth.Contract(JSON.parse(BalanceMath.abi), address);
        done();
    });
});

describe("Test BalanceMath", () => {
    it("add", async () => {
        var M = objects.math;
        var res = await M.methods.add(1, 2).call()
        console.log(web3.utils.toBN(res));
        assert(web3.utils.toBN(res).eq(web3.utils.toBN(3)));
    });
});
