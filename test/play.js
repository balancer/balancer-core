let t = require("../util/twrap.js");

let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../pkg.js");
pkg.types.loadTestTypes();

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

// Precondition:
// env.web3 exists
// env.types exists
// env.admin exists, env.eth.web3.defaultOptions.from == env.admin
module.exports.scene1 = async (env) => {
    let BFactory = new t.TType(env.web3, env.types, "BFactory");
    env.factory = await BFactory.deploy();
    let color = await env.factory.getColor();
    assert.equal(color, web3.utils.padRight(web3.utils.toHex("BRONZE"), 64));
    env.bpool = await env.factory.newBPool();
    return env;
}


