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

let toWei = web3.utils.toWei;

module.exports.scene1 = async (env) => {
    env.MAX = web3.utils.hexToNumberString(web3.utils.toTwosComplement('-1'));
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

module.exports.scene2 = async(env) => {
    await env.MKR.mint(env.initMKR);
    await env.ETH.mint(env.initETH);
    await env.DAI.mint(env.initDAI);

    await env.bpool.bind(env.MKR.__address, toWei('10'), toWei('1.1'));
    await env.bpool.bind(env.ETH.__address, toWei('40'), toWei('1.1'));
    await env.bpool.bind(env.DAI.__address, toWei('5000'), toWei('1.1'));

    await env.bpool.start();

    return env;
}
