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
    var acct0; var acct1; var acct2;
    var bpool;
    var acoin; var bcoin; var ccoin;
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        acct0 = accts[0];
        acct1 = accts[1];
        acct2 = accts[2];
        acoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("A")]);
        bcoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("B")]);
        ccoin = await pkg.deploy(web3, acct0, "BToken", [web3.utils.asciiToHex("C")]);
        bpool = await pkg.deploy(web3, acct0, "BalancerPool");
    });
    it("is a test", () => {
        console.log("hi");
    });
});
