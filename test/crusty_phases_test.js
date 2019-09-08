const Web3 = require('web3')
const ganache = require('ganache-core')
const assert = require('chai').assert
const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const scene = require('./crusty_phases.js')

describe('crusty_phases tests', async () => {
  let accts
  let admin
  let env = {}

  it('phase0 postconditions', async () => {
    env = await scene.phase0(web3, admin)

    assert.exists(env.admin)
    assert.exists(env.user1)
    assert.exists(env.user2)
    assert.exists(env.factory)
  })

  it('phase1 postconditions', async () => {
    env = await scene.phase1(web3, admin)

    assert.exists(env.bpool, 'bpool')
    const poolBuiltHere = await env.factory.methods.isBPool(env.bpool._address).call()
    assert(poolBuiltHere, "factory doesn't remember building bpool")

    assert.exists(env.acoin)
    assert.exists(env.bcoin)
    assert.exists(env.ccoin)

    const max = web3.utils.toBN(web3.utils.toTwosComplement('-1'))
    for (const coin of [env.acoin, env.bcoin, env.ccoin]) {
      const bal = await coin.methods.balanceOf(env.admin).call()
      assert.equal(bal, max)
      // DSToken MAX_U256 means infinite allowance
      allowance = await coin.methods.allowance(env.admin, env.bpool._address).call()
      assert.equal(allowance, max)
    }
  })

  it('phase2 postconditions', async () => {
    env = await scene.phase2(web3, admin)
    const paused = await env.bpool.methods.isPaused().call()
    assert.isFalse(paused)
    for (const coin of [env.acoin, env.bcoin, env.ccoin]) {
      const bal = await env.bpool.methods.getBalance(coin._address).call()
      const truebal = await coin.methods.balanceOf(env.bpool._address).call()
      assert.equal(bal, env.initBalance, 'wrong bpool.getBalance(coin)')
      assert.equal(truebal, env.initBalance, 'wrong coin.balanceOf(bpool)')
    }
  })

  it('phase3 postconditions', async () => {
    env = await scene.phase3(web3, admin)
    for (user of [env.user1, env.user2]) {
      for (coin of [env.acoin, env.bcoin, env.ccoin]) {
        const bal = await coin.methods.balanceOf(user).call()
        assert.equal(bal, env.initBalance)
        const max = web3.utils.toBN(web3.utils.toTwosComplement('-1'))
        const allowance = await coin.methods.allowance(user, env.bpool._address).call()
        assert.equal(allowance, max)
      }
    }
  })
})
