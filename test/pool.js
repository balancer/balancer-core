let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../pkg.js");
let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

describe("BalancerPool", () => {
    var accts;
    var acct0;
    var bpool;
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        acct0 = accts[0];
        bpool = await pkg.deploy(web3, acct0, "BalancerPool");
    });
    it("is a test", () => {
        console.log("hi");
    });
});
