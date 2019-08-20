let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;

let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let scene = require("./scene.js");
describe("scene 0 tests", async () => {
    let accts;
    let admin;
    let env = {};
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        admin = accts[0];
        env = await scene.phase0(web3, admin);
    });
    it("phase 0 preconditions", async () => {
        console.log("it");
        assert.exists(env.admin);
        assert.exists(env.factory);
    });
});
