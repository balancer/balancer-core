let Web3 = require("web3"); // utils only
let toWei = Web3.utils.toWei;
let fromWei = Web3.utils.fromWei;

let t = require("./twrap.js");
let types_ = require("./types.js");
types_.loadTestTypes();


let env;
let web3;
let staged = false;

module.exports.stage = async (web3_, accts_) => {
    env = {};
    env.web3 = web3_
    env.MAX = Web3.utils.hexToNumberString(Web3.utils.toTwosComplement('-1'));
    if (accts_ == undefined) {
        accts_ = await env.web3.eth.getAccounts();
    }

    env.types = types_;

    env.accts = accts_
    env.Ali = env.accts[0];
    env.Bob = env.accts[1];
    env.Cat = env.accts[1];

    env.web3.opts = {
        from: env.Ali,
        gas: 6000000
    }

    staged = true;
    return env;
}

module.exports.scene1 = async () => {
    assert(staged, "please call `stage`");
    let TToken = new t.TType(env.web3, env.types, "TToken");

    env.ETH = await TToken.deploy();
    env.DAI = await TToken.deploy();
    env.MKR = await TToken.deploy();

    let BFactory = new t.TType(env.web3, env.types, "BFactory");

    env.factory = await BFactory.deploy();
    env.bpool = await env.factory.newBPool();

    for (user of [env.Ali, env.Bob, env.Cat]) {
        for (coin of [env.ETH, env.DAI, env.MKR]) {
            env.web3.opts.from = user;
            await coin.approve(env.bpool.__address, env.MAX);
        }
    }
    env.web3.opts.from = env.Ali;

    staged = false;
    return env;
}

module.exports.scene2 = async(web3) => {
    await module.exports.scene1();

    env.initDAI = toWei('5000');
    env.initETH = toWei('40');
    env.initMKR = toWei('10');

    await env.MKR.mint(env.initMKR);
    await env.ETH.mint(env.initETH);
    await env.DAI.mint(env.initDAI);

    await env.bpool.bind(env.MKR.__address, toWei('10'), toWei('1.1'));
    await env.bpool.bind(env.ETH.__address, toWei('40'), toWei('1.1'));
    await env.bpool.bind(env.DAI.__address, toWei('5000'), toWei('1.1'));

    await env.bpool.start();

    return env;
}
