let t = require("../util/twrap.js");

let ganache = require("ganache-core");

let pkg = require("../pkg.js");
pkg.types.loadTestTypes();

let Web3 = require('web3'); // utils only

let toWei = Web3.utils.toWei;

module.exports.scene0 = async (web3) => {
    let env = {};
    env.web3 = web3;
    env.types = pkg.types;

    env.accts = await env.web3.eth.getAccounts();
    env.admin = env.accts[0];
    env.user1 = env.accts[1];
    env.user2 = env.accts[1];

    env.web3.opts = {
        from: env.admin,
        gas: 6000000
    }

    return env;
}
module.exports.scene1 = async (web3) => {
    let env = await module.exports.scene0(web3);
    env.MAX = Web3.utils.hexToNumberString(Web3.utils.toTwosComplement('-1'));
    env.initDAI = toWei('5000');
    env.initETH = toWei('40');
    env.initMKR = toWei('10');

    let TToken = new t.TType(env.web3, env.types, "TToken");

    env.ETH = await TToken.deploy();
    env.DAI = await TToken.deploy();
    env.MKR = await TToken.deploy();

    let BFactory = new t.TType(env.web3, env.types, "BFactory");

    env.factory = await BFactory.deploy();
    env.bpool = await env.factory.newBPool();

    for (user of [env.admin, env.user1, env.user2]) {
        for (coin of [env.ETH, env.DAI, env.MKR]) {
            env.web3.opts.from = user;
            await coin.approve(env.bpool.__address, env.MAX);
        }
    }
    env.web3.opts.from = env.admin;
    return env;
}

module.exports.scene2 = async(web3) => {
    let env = await module.exports.scene1(web3);
    await env.MKR.mint(env.initMKR);
    await env.ETH.mint(env.initETH);
    await env.DAI.mint(env.initDAI);

    await env.bpool.bind(env.MKR.__address, toWei('10'), toWei('1.1'));
    await env.bpool.bind(env.ETH.__address, toWei('40'), toWei('1.1'));
    await env.bpool.bind(env.DAI.__address, toWei('5000'), toWei('1.1'));

    await env.bpool.start();

    return env;
}
