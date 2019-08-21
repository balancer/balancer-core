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
let mathTests = {
    "calc_OutGivenIn": [
        [1, [1, 1, 1, 1, 1, 0]]
    ]
}


describe("generated tests: BMath", () => {
    let env;
    let bmath;
    beforeEach(async () => {
        env = await scene.phase0(web3);
        bmath = await pkg.deploy(web3, env.admin, "BMath");
    });
    for(let funcname in mathTests) {
        pairs = mathTests[funcname]
        for( let pair of pairs) {
            let expected = pair[0];
            let args = pair[1]
            let desc = `${expected} ?= ${funcname}(${args})`;
            it(desc, async () => {
                let actual = await bmath.methods[funcname](...args).call();
                assert.equal(actual, expected);
            });
        }
    }
});
