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
  let env = {};

  beforeEach(async () => {
    env.web3 = web3;
    env.accts = await env.web3.eth.getAccounts();
    env.admin = env.accts[0];
    env.user1 = env.accts[1];
    env.user2 = env.accts[1];
    env.web3.opts = {
        from: env.admin,
        gas: 6000000
    }
    env.types = pkg.types;
  });

  it('scene 1', async () => {
    env = await play.scene1(env);
    assert.exists(env.admin);
    assert.exists(env.factory);
    assert.exists(env.bpool);
    
    let numTokens = await env.bpool.getNumTokens();
    assert.equal(numTokens, 0);

    let approval = await env.ETH.allowance(env.admin, env.bpool.__address);
    assert.equal(approval, env.MAX);
  });

  it('scene 2', async() => {
    env = await play.scene2(env);
    let bal = await env.DAI.balanceOf(env.bpool.__address);
    assert.equal(bal, env.initDAI);
    let paused = await env.bpool.isPaused();
    assert( ! paused);
    let joinable = await env.bpool.isJoinable();
    assert( ! joinable);
  });

});
