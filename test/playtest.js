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

describe('a play about balancer', async () => {
  it('scene 1', async () => {
    let env = await play.scene1(web3);
    assert.exists(env.admin);
    assert.exists(env.factory);
    assert.exists(env.bpool);
    
    let numTokens = await env.bpool.getNumTokens();
    assert.equal(numTokens, 0);

    let approval = await env.ETH.allowance(env.admin, env.bpool.__address);
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
  });

});
