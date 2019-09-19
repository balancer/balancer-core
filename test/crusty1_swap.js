const Web3 = require('web3')
const ganache = require('ganache-core')
const assert = require('chai').assert
const fmath = require('../util/floatMath.js').floatMath
const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const scene = require('./crusty1_phases.js')
const points = require('./points.js')

const toBN = web3.utils.toBN
const toWei = (n) => web3.utils.toWei(n.toString())
const toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()))

const assertCloseBN = (a, b, tolerance) => {
  tolerance = toBN(toWei(tolerance))
  const diff = toBN(a).sub(toBN(b)).abs()
  assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`)
}

// Single-swap basic tests
describe('swaps', () => {
  let env
  beforeEach(async () => {
    env = await scene.phase3(web3)
    assert.exists(env.initWeight)
    assert.exists(env.initBalance)
    assert.exists(env.bpool)
  })
  for (const pt of points.math.calc_OutGivenIn) {
    it(`test pt ${pt}`, async () => {
      const expected = pt[0]
      const args = pt[1]
      const Bi = args[0]; const Wi = args[1]
      const Bo = args[2]; const Wo = args[3]
      const Ai = args[4]
      const fee = args[5]
      try {
        await env.bpool.methods.setParams(env.acoin._address, toWei(Bi), toWei(Wi))
          .send({ from: env.admin, gas: 0xffffffff })
        await env.bpool.methods.setParams(env.bcoin._address, toWei(Bo), toWei(Wo))
          .send({ from: env.admin, gas: 0xffffffff })
        await env.bpool.methods.setFee(toWei(fee))
          .send({ from: env.admin, gas: 0xffffffff })

        const res = await env.bpool.methods
          .swap_ExactAmountIn(env.acoin._address, toWei(Ai) // Ti, Ai
            , env.bcoin._address, '0' // To, Ao
            , '0') // LP

        if (typeof (expected) === 'number') {
          assertCloseBN(res, toWei(expected), toWei('0.0000001'))
        }
        if (typeof (expected) === 'string') {
          assert.equal(res, expected)
        }

        throw null
      } catch (err) {
        if (err != null && typeof (expected) === 'string') {
          assert.equal(err.name, 'RuntimeError')
          // extract error string
          assert(Object.keys(err.results).length == 1, 'more than one exception in transaction!?')
          const trxID = Object.keys(err.results)[0]
          const info = err.results[trxID]
          const errStr = info.reason
          assert.equal(errStr, expected)
        }
      }
    })
  }
})
