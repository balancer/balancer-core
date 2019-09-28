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

const toBN = web3.utils.toBN;

const scene = require('./crusty1_phases.js')

describe('manager and pooling', async () => {
  let env = {}
  let accts
  let admin
  beforeEach(async () => {
    accts = await web3.eth.getAccounts()
    admin = accts[0]
    env = await scene.phase3(web3)
    env.accts = accts
    env.admin = admin
  })

  it('fast join/exit', async () => {
    await env.bpool.methods.finalize(web3.utils.toWei('1000000'))
      .send({ from: env.admin, gas: 0xffffffff })
    const ABalBefore = await env.bpool.methods.getBalance(env.acoin._address).call()
    const BBalBefore = await env.bpool.methods.getBalance(env.bcoin._address).call()
    const PSupplyBefore = await env.bpool.methods.totalSupply().call()

    await env.bpool.methods.joinPool(web3.utils.toWei('1.0'))
      .send({ from: env.admin, gas: 0xffffffff })
    const ABalMiddle = await env.bpool.methods.getBalance(env.acoin._address).call()
    const BBalMiddle = await env.bpool.methods.getBalance(env.bcoin._address).call()
    const PSupplyMiddle = await env.bpool.methods.totalSupply().call()
    console.log(ABalMiddle);

    assert(toBN(ABalMiddle).gt(toBN(ABalBefore)), "pool did not gain tokens on join");

    await env.bpool.methods.exitPool(web3.utils.toWei('1.0'))
      .send({ from: env.admin, gas: 0xffffffff })

    const ABalAfter = await env.bpool.methods.getBalance(env.acoin._address).call()
    const BBalAfter = await env.bpool.methods.getBalance(env.bcoin._address).call()
    const PSupplyAfter = await env.bpool.methods.totalSupply().call()

    assert(toBN(ABalAfter).lt(toBN(ABalMiddle)), "pool did not lose tokens on exit");

  })

})
