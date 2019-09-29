const assert = require('chai').assert;
const Web3 = require('web3')
const ganache = require('ganache-core')
const t = require('../util/twrap.js');
const types = require('../util/types.js');
types.loadTestTypes();

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const toWei = web3.utils.toWei
const fromWei = web3.utils.fromWei

const slightly = require('../util/slightly.js');
const MAX = web3.utils.toTwosComplement(-1);

describe('fast', async () => {
    let accts;
    let stub;
    let pool;
    let factory;
    let DAI;
    let ETH;

    before(async () => {
        let accts = await web3.eth.getAccounts();
        web3.opts = {
          from: accts[0],
          gas: 7000000
        }
        const BStub = new t.TType(web3, types, 'BStub')
        const BPool = new t.TType(web3, types, 'BPool')
        const BFactory = new t.TType(web3, types, 'BFactory')
        const TToken = new t.TType(web3, types, 'TToken')

        factory = await BFactory.deploy();

        pool = await factory.newBPool();

        DAI = await TToken.deploy();
        MKR = await TToken.deploy();
        console.log('deployed pool and tokens')

        await DAI.mint(toWei('1000000000')) // 1 billion
        await MKR.mint(toWei('1000000'))  // 1 million
        console.log('minted tokens')

        for (const user of [accts[0], accts[1]]) {
          for (const coin of [DAI, MKR, pool]) {
            web3.opts.from = user
            await coin.approve(pool.__address, MAX)
          }
        }
        web3.opts.from = accts[0]
        console.log('set up approvals')

        await pool.bind(DAI.__address);
        await pool.bind(MKR.__address);
        console.log('tokens bound');
        await pool.start();
        console.log('started');
    });

    beforeEach(async () => {
        await pool.setParams(DAI.__address, toWei('1000000'), toWei('2.5')) // 1 million balance
        await pool.setParams(MKR.__address, toWei('1000'), toWei('3.5')) // 1 thousand balance
        console.log('reset params')
    });

    it('correct setup', async () => {
        let res = await pool.getBalance(DAI.__address);
        assert.equal(res, toWei('1000000'))
    });

    it('newBPool', async () => {
    });

    it('bind getNumTokens isBound', async () => {
        throw 'unimplemented';
    });

    it('bind ERR_NOT_CONTROLLER ERR_IS_BOUND ERR_IS_FINALIZED', async () => {
        throw 'unimplemented';
    });

    it('bind ERR_MAX_TOKENS', async () => {
        throw 'unimplemented';
    });

    it('batchBind getNumTokens isBound', async () => {
        throw 'unimplemented';
    });

    it('batchBind ERR_NOT_CONTROLLER ERR_IS_BOUND ERR_NOT_FINALIZED', async () => {
        throw 'unimplemented';
    });

    it('batchBind ERR_IS_BOUND ERR_IS_FINALIZED ERR_MAX_TOKENS', async () => {
        throw 'unimplemented';
    });

    it('unbind getNumTokens isBound', async()=>{
        throw 'unimplemented';
    });

    it('unbind ERR_NOT_CONTROLLER ERR_NOT_BOUND ERR_IS_FUNDED', async () => {
        throw 'unimplemented';
    });

    it('clear getBalance getWeight getNumTokens isBound isFunded', async () => {
        throw 'unimplemented';
    });

    it('clear ERR_NOT_CONTROLLER ERR_IS_FINALIZED', async () => {
        throw 'unimplemented';
    });

    it('setParams getBalance getWeight getSpotPrice', async () => {
        throw 'unimplemented';
    });

    it('setParams ERR_NOT_CONTROLLER ERR_NOT_BOUND ERR_IS_FINALIZED', async () => {
        throw 'unimplemented';
    });

    it('setParams ERR_MIN_WEIGHT ERR_MAX_WEIGHT ERR_MIN_BALANCE ERR_MAX_BALANCE', async () => {
        throw 'unimplemented';
    });

    it('setParams ERR_MAX_TOTAL_WEIGHT', async () => {
        throw 'unimplemented';
    });

    it('setParams ERR_BTOKEN_UNDERFLOW ERR_ERC20_FALSE', async () => {
        throw 'unimplemented';
    });

    it('batchSetParams getBalance getWeight getSpotPrice', async () => {
        throw 'unimplemented';
    });

    it('batchSetParams ERR_NOT_CONTROLLER ERR_NOT_BOUND ERR_IS_FINALIZED', async () => {
        throw 'unimplemented';
    });

    it('batchSetParams ERR_MIN_WEIGHT ERR_MAX_WEIGHT ERR_MIN_BALANCE ERR_MAX_BALANCE', async () => {
        throw 'unimplemented';
    });

    it('batchSetParams ERR_MAX_TOTAL_WEIGHT', async () => {
        throw 'unimplemented';
    });

    it('batchSetParams ERR_BTOKEN_UNDERFLOW ERR_ERC20_FALSE', async () => {
        throw 'unimplemented';
    });

    it('clear ERR_NOT_CONTROLLER ERR_NOT_FINALIZED getBalance getTokens', async () => {
    });

    it('batchSetParams ERR_ERC20_FALSE', async () => {
        throw 'unimplemented';
    });

    it('setFees ERR_NOT_CONTROLLER ERR_MAX_FEE getFees', async () => {
        throw 'unimplemented';
    });

    it('setController getController ERR_NOT_CONTROLLER', async () => {
    });

});
