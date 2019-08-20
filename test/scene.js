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
//  poolcoin = bpool.getPoolToken
//  acoin,bcoin,ccoin = new btokens
//  *coin.mint( MAX )
//    --> *coin.balance == MAX
module.exports.phase1 = async (web3, admin) => {
    let env = await module.exports.phase0(web3, admin);
    var fn_newBPool = await env.factory.methods.newBPool();
    let bpoolAddr = await fn_newBPool.call();
    env.bpool = new web3.eth.Contract(JSON.parse(pkg.types.types.BPool.abi), bpoolAddr);
    await fn_newBPool.send({from: admin, gas:0xffffffff});
    let poolcoinAddr = await env.bpool.methods.getPoolToken().call();
    env.poolcoin = new web3.eth.Contract(JSON.parse(pkg.types.types.BToken.abi), poolcoinAddr);

    env.acoin = await pkg.types.deploy(web3, admin, "TToken", ["A"]);
    env.bcoin = await pkg.types.deploy(web3, admin, "TToken", ["B"]);
    env.ccoin = await pkg.types.deploy(web3, admin, "TToken", ["C"]);

    env.acoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});
    env.bcoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});
    env.ccoin.methods.mint(web3.utils.toTwosComplement('-1')).send({from: admin});

    return env;
}

// phase2:
//  initWeight = toWei(10)
//  initBalance = toWei(1000)
//  bpool.bind(*coin, initWeight, initBalance)
module.exports.phase2 = async (web3, admin) => {
    let env = await module.exports.phase1(web3, admin);
    env.initWeight = web3.utils.toWei('10');
    env.initBalance = web3.utils.toWei('10');
    await env.bpool.methods.bind(env.acoin._address, env.initBalance, env.initWeight)
                           .send({from: admin, gas:0xffffffff});
    await env.bpool.methods.bind(env.bcoin._address, env.initBalance, env.initWeight)
                           .send({from: admin, gas:0xffffffff});
    await env.bpool.methods.bind(env.ccoin._address, env.initBalance, env.initWeight)
                           .send({from: admin, gas:0xffffffff});
    return env;
}
