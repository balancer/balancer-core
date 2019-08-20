let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");

// phase0: 
//  admin = accts[0]
//  factory = new factory
module.exports.phase0 = async (web3, admin) => {
    let deploy = (w, a, t) => pkg.types.deploy(web3, admin, t);
    let env = {};
    env.admin = admin;
    env.factory = await deploy(web3, admin, "BFactory");
    return env;
}

// phase1:
//  bpool = new bpool
//  acoin,bcoin,ccoin = new btokens
//  *coin.mint( MAX )
//    --> *coin.balance == MAX
module.exports.phase1 = async (web3, admin) => {
    let env = await module.exports.phase0(web3, admin);
    var fn = await env.factory.methods.newBPool();
    let bpoolAddr = await fn.call();
    env.bpool = new web3.eth.Contract(JSON.parse(pkg.types.types.BPool.abi), bpoolAddr);
    await fn.send({from: admin, gas:0xffffffff});

    env.acoin = await pkg.types.deploy(web3, admin, "TToken", ["A"]);
    env.bcoin = await pkg.types.deploy(web3, admin, "TToken", ["B"]);
    env.ccoin = await pkg.types.deploy(web3, admin, "TToken", ["C"]);

    env.acoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});
    env.bcoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});
    env.ccoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});

    return env;
}

