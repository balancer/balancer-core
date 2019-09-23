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

const toBN = Web3.utils.toBN
const toWei = Web3.utils.toWei
const fromWei = Web3.utils.fromWei

const play = require('../util/play.js')

const slightly = require('../util/slightly.js');

let MAX = web3.utils.toTwosComplement(-1);

describe("fernando's test sequence", async () => {
  let env;

  it('cmp meta', async () => {
    assert(slightly.approx(toWei('1.0000000001'), toWei('1')));
    assert(slightly.sgte(toWei('1.0000000001'), toWei('1')));

    assert(slightly.approx(toWei('0.9999999999'), toWei('1')));
    assert(slightly.slte(toWei('0.99999999999'), toWei('1')));
  }); 
 
  it('is one long test', async function() {
    this.timeout(5000);
    await play.stage(web3);
    env = await play.scene0();
    env.bpool.__log = console.log;
    let MKR = env.MKR.__address;
    let DAI = env.DAI.__address;

    let checkTBW = async (t,b,w) => {
        assert(slightly.approx((await env.bpool.getBalance(t)), toWei(b.toString())));
        assert(slightly.approx((await env.bpool.getDenormalizedWeight(t)), toWei(w.toString())));
    }

    await env.bpool.setParams(MKR, toWei('4'), toWei('10'));
    await env.bpool.setParams(DAI, toWei('12'), toWei('10'));
    await checkTBW(MKR, 4, 10)
    await checkTBW(DAI, 12, 10);

    // 1
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('2'), DAI, toWei('0'), MAX);
    assert(slightly.slte(res[0], toWei('4')));
    assert(slightly.sgte(res[1], toWei('0.75')));
    assert.equal(await env.bpool.getSpotPrice(MKR, DAI), toWei('0.75'));
    assert.equal(await env.bpool.getSpotPriceSansFee(MKR, DAI), toWei('0.75'));
    await checkTBW(MKR, 6, 10)
    await checkTBW(DAI, 8, 10);

    // 2
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('2'), DAI, toWei('0'), MAX);
    assert(slightly.approx(res[0], toWei('2'))); // TODO WARN  .slte
    assert(slightly.sgte(res[1], toWei((4/3).toString())));
    assert(slightly.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((4/3).toString())));
    await checkTBW(MKR, 8, 10)
    await checkTBW(DAI, 6, 10);

    // 3
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('4'), DAI, toWei('0'), MAX);
    assert(slightly.slte(res[0], toWei('2')));
    assert(slightly.sgte(res[1], toWei((3).toString())));
    assert(slightly.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((3).toString())));
    await checkTBW(MKR, 12, 10)
    await checkTBW(DAI, 4, 10);

    // 4
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('1'), DAI, toWei('0'), MAX);
    assert(slightly.approx(res[0], toWei('4'))); // TODO warn .slte
    assert(slightly.sgte(res[1], toWei((16/3).toString())));
    assert(slightly.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((16/3).toString())));
    await checkTBW(MKR, 16, 10)
    await checkTBW(DAI, 3, 10);

    // 5
    res = await env.bpool.swap_ExactAmountIn(MKR, toWei('1'), DAI, toWei('0'), MAX);
    assert(slightly.slte(res[0], toWei('8')));
    assert(slightly.sgte(res[1], toWei((12).toString())));
    assert(slightly.sgte(await env.bpool.getSpotPrice(MKR, DAI), toWei((12).toString())));
    await checkTBW(MKR, 24, 10)
    await checkTBW(DAI, 2, 10);

  })

});


describe('joinswap / exitswap', async()=>{
  let env;
  it('is one long test', async function() {
    this.timeout(0);
    await play.stage(web3);
    env = await play.scene0();
    env.bpool.__log = console.log;
    let MKR = env.MKR.__address;
    let DAI = env.DAI.__address;

    let checkTBW = async (t,b,w) => {
        assert(slightly.approx((await env.bpool.getBalance(t)), toWei(b.toString())), `check balance failed expected: ${b}`);
        assert(slightly.approx((await env.bpool.getDenormalizedWeight(t)), toWei(w.toString())), `check weight failed expected: ${w}`);
    }

    let checkP = async (p) => {
        assert(slightly.approx((await env.bpool.totalSupply()), toWei(p.toString())));
    }

    await env.bpool.setParams(MKR, toWei('4'), toWei('10'));
    await env.bpool.setParams(DAI, toWei('12'), toWei('10'));
    await env.bpool.finalize(toWei('100'));

    await checkTBW(MKR, 4, 10);
    await checkTBW(DAI, 12, 10);
    await checkP(100);

    // 8
    await env.bpool.joinPool(toWei('10'));
    await checkTBW(MKR, 4.4, 10);
    await checkTBW(DAI, 13.2, 10);
    await checkP(110);

    // 9
    await env.bpool.exitPool(toWei('10'));
    await checkTBW(MKR, 4, 10);
    await checkTBW(DAI, 12, 10);
    await checkP(100);

    // 10
    let res = await env.bpool.joinswap_ExternAmountIn(MKR, toWei('1.76')); 
    await checkTBW(MKR, 5.76, 10);
    await checkTBW(DAI, 12, 10);
    await checkP(120);

  });
});
