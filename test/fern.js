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

const toBN = web3.utils.toBN
const toWei = web3.utils.toWei
const fromWei = web3.utils.fromWei

const TOLERANCE = '0.000000001'

// slightly gte (bignum)
assert.sgte = (a, b, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = web3.utils.toBN(web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = web3.utils.toBN(b);
    }
    errstr = `assert.sgte(${fromWei(a)}, ${fromWei(b)}, (tolerance=${fromWei(tolerance)}))`;
    let diff = a.sub(b);
    assert( diff.cmp(0) >= 0, errstr );
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}
// slightly lte (bignum)
assert.slte = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = web3.utils.toBN(web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = web3.utils.toBN(b);
    }
    errstr = `assert.slte(${a}, ${b}, (tolerance=${tolerance}))`;
    let diff = a.sub(b);
    assert( diff.cmp(toBN('0')) <= 0, errstr );
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}

assert.approx = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = web3.utils.toBN(web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = web3.utils.toBN(b);
    }
    errstr = `assert.approx(${a}, ${b}, (tolerance=${tolerance}))`;
    let diff = a.sub(b);
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}

let MAX = web3.utils.toTwosComplement(-1);

describe("fernando's test sequence", async () => {
  let env;

  it('cmp meta', async () => {
    assert.approx(toWei('1.0000000001'), toWei('1'));
    assert.sgte(toWei('1.0000000001'), toWei('1'));

    assert.approx(toWei('0.9999999999'), toWei('1'));
    assert.slte(toWei('0.99999999999'), toWei('1'));
  }); 
 
  it('is one long test', async function() {
    this.timeout(5000);
    await play.stage(web3);
    env = await play.scene0();
    env.bpool.__log = console.log;
    let MKR = env.MKR.__address;
    let DAI = env.DAI.__address;

    let checkTBW = async (t,b,w) => {
        assert.approx((await env.bpool.getBalance(t)), toWei(b.toString()));
        assert.approx((await env.bpool.getDenormalizedWeight(t)), toWei(w.toString()));
    }

    await env.bpool.setParams(MKR, toWei('4'), toWei('100'));
    await env.bpool.setParams(DAI, toWei('12'), toWei('100'));
    await checkTBW(MKR, 4, 100)
    await checkTBW(DAI, 12, 100);

    // 1
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('2'), DAI, toWei('0'), MAX);
    assert.slte(res[0], toWei('4'));
    assert.sgte(res[1], toWei('0.75'));
    assert.equal(await env.bpool.getSpotPrice(MKR, DAI), toWei('0.75'));
    assert.equal(await env.bpool.getSpotPriceSansFee(MKR, DAI), toWei('0.75'));
    await checkTBW(MKR, 6, 100)
    await checkTBW(DAI, 8, 100);

    // 2
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('2'), DAI, toWei('0'), MAX);
    assert.approx(res[0], toWei('2')); // TODO WARN  .slte
    assert.sgte(res[1], toWei((4/3).toString()));
    assert.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((4/3).toString()));
    await checkTBW(MKR, 8, 100)
    await checkTBW(DAI, 6, 100);

    // 3
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('4'), DAI, toWei('0'), MAX); // bad error
    assert.slte(res[0], toWei('2'));
    assert.sgte(res[1], toWei((3).toString()));
    assert.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((3).toString()));
    await checkTBW(MKR, 12, 100)
    await checkTBW(DAI, 4, 100);

  })
});
