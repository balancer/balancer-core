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

let play = require('./play.js');

let toWei = web3.utils.toWei;
let fromWei = web3.utils.fromWei;

describe('a play about balancer', async () => {
  it('scene 1', async () => {
    let env = await play.scene1(web3);
    assert.exists(env.Ali);
    assert.exists(env.factory);
    assert.exists(env.bpool);
    
    let numTokens = await env.bpool.getNumTokens();
    assert.equal(numTokens, 0);

    let approval = await env.ETH.allowance(env.Ali, env.bpool.__address);
    assert.equal(approval, env.MAX);
  });

  it('scene 2', async() => {
    let env = await play.scene2(web3);
    let bal = await env.DAI.balanceOf(env.bpool.__address);
    assert.equal(bal, env.initDAI);
    let paused = await env.bpool.isPaused();
    assert( ! paused);
    let joinable = await env.bpool.isJoinable();
    assert( ! joinable);

    // TODO spotPriceExternal
    let mkrAddr = env.MKR.__address;
    let daiAddr = env.DAI.__address;
    let ethAddr = env.ETH.__address;
    let mkrB = await env.bpool.getBalance(mkrAddr)
    let daiB = await env.bpool.getBalance(daiAddr);
    let mkrW = await env.bpool.getWeight(mkrAddr);
    let daiW = await env.bpool.getWeight(daiAddr);
    let mkrIndai = await env.bpool.calc_SpotPrice(mkrB, mkrW, daiB, daiW);
    console.log(fromWei(mkrIndai));
    let daiInmkr = await env.bpool.calc_SpotPrice(daiB, daiW, mkrB, mkrW);
    console.log(fromWei(daiInmkr));
    // TODO price orientations etc

    let err = await env.bpool.CATCH_joinPool('0');
    assert.equal(err, "ERR_UNJOINABLE");
  });
});
