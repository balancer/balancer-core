const assert = require('chai').assert;
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

describe('a play about balancer', async () => {
  beforeEach(async () => {
    await play.stage(web3)
  })

  it('fast scene0', async () => {
    const env = await play.scene0()
    assert.exists(env.Ali)
    assert.exists(env.Bob)
    assert.exists(env.factory)
    assert.exists(env.bpool)

    const numTokens = await env.bpool.getNumTokens()
    assert.equal(numTokens, 3)

    const approval = await env.ETH.allowance(env.Ali, env.bpool.__address)
    assert.equal(approval, env.MAX)

    env.web3.opts.from = env.Bob
    let err = await env.bpool.CATCH_setParams(env.DAI.__address, toWei('100'), toWei('1.5'))
    assert.equal(err, 'ERR_NOT_CONTROLLER')
    env.web3.opts.from = env.Ali

    const bal = await env.DAI.balanceOf(env.bpool.__address)
    assert.equal(bal, env.initDAI)
    const paused = await env.bpool.isPaused()
    assert(!paused)
    const joinable = await env.bpool.isFinalized()
    assert(!joinable)

    const mkrAddr = env.MKR.__address
    const daiAddr = env.DAI.__address
    const ethAddr = env.ETH.__address

    const mkrB = await env.bpool.getBalance(mkrAddr)
    const daiB = await env.bpool.getBalance(daiAddr)
    const mkrW = await env.bpool.getDenormalizedWeight(mkrAddr)
    const daiW = await env.bpool.getDenormalizedWeight(daiAddr)

    err = await env.bpool.CATCH_joinPool('0')
    assert.equal(err, 'ERR_NOT_FINALIZED')

    err = await env.bpool.CATCH_getFinalTokens()
    assert.equal(err, 'ERR_NOT_FINALIZED')

  })

})
