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

var env = {};

beforeEach(async () => {
    env = await deployer.deployTestEnv(web3, buildout);
});

describe("test scenario", () => {
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
