const assert = require('assert');
const t = require('../util/twrap.js')

const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const play = require('../util/play.js')

const toWei = web3.utils.toWei
const fromWei = web3.utils.fromWei

// slightly gte (bignum)
assert.sgte = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = web3.utils.toBN(web3.utils.toWei('0.0000001'))
    }
    if( errstr == undefined) {
        errstr = `assert.sgte(${a}, ${b}, (tolerance=${tolerance}))`;
    }
    if(typeof(a) == 'string') {
        a = web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = web3.utils.toBN(b);
    }
    let diff = a.sub(b);
    assert( diff.cmp(0) >= 0, errstr );
    assert( diff.lt(tolerance), errstr );
}
// slightly lte (bignum)
assert.slte = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = web3.utils.toBN(web3.utils.toWei('0.0000001'))
    }
    if( errstr == undefined) {
        errstr = `assert.sgte(${a}, ${b}, (tolerance=${tolerance}))`;
    }
    if(typeof(a) == 'string') {
        a = web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = web3.utils.toBN(b);
    }
    let diff = a.sub(b);
    assert( diff.cmp(0) <= 0, errstr );
    assert( diff.abs().lt(tolerance), errstr );
}



describe("fernando's test sequence", async () => {
  let env;
  
  it('is one long test', async function() {
    this.timeout(5000);
    await play.stage(web3);
    env = await play.scene0();
    let MKR = env.MKR.__address;
    let DAI = env.DAI.__address;
    console.log('MKR', MKR);
    console.log('DAI', DAI);
    res = await env.bpool.setParams(MKR, toWei('4'), toWei('10'));
    console.log(env.bpool.__lastDesc);
    console.log(env.bpool.__lastGas);
    console.log(res);
    res = await env.bpool.setParams(DAI, toWei('12'), toWei('10'));
    console.log(env.bpool.__lastDesc);
    console.log(env.bpool.__lastGas);
    console.log(res);
    assert.equal(await env.bpool.getBalance(MKR), toWei('4'));
    assert.equal(await env.bpool.getWeight(MKR), toWei('10'));
    assert.equal(await env.bpool.getBalance(DAI), toWei('12'));
    assert.equal(await env.bpool.getWeight(DAI), toWei('10'));

    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('2'), DAI, toWei('0'), toWei('0'));
    console.log(res);
    assert.equal(await env.bpool.getBalance(MKR), toWei('6'));
    assert.equal(await env.bpool.getWeight(MKR), toWei('10'));
    assert.equal(await env.bpool.getBalance(DAI), toWei('8'));
    assert.equal(await env.bpool.getWeight(DAI), toWei('10'));

  })
});
