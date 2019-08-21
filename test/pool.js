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
        let PBalBefore = await env.bpool.methods.getPoolTokenSupply().call();

        await env.bpool.methods.joinPool(web3.utils.toWei('1.0'))
                       .send({from: env.admin});
    });
});


