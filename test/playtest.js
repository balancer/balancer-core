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

describe('a play about balancer', async () => {
  let env = {};

  beforeEach(async () => {
    env.web3 = web3;
    env.accts = await env.web3.eth.getAccounts();
    env.admin = env.accts[0];
    env.web3.eth.defaultOptions = {
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
  });
});
