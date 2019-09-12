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

const scene = require('./crusty_phases.js')
const points = require('./points.js')

const toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()))

const tolerance = 10 ** -6
const toleranceBN = toBNum(tolerance)
assert.closeBN = (actual, expected) => {
  let actualBN = actual
  let expectedBN = expected
  if (typeof (actual) === 'string') {
    actualBN = web3.utils.toBN(actual)
  }
  if (typeof (expected) === 'string') {
    expectedBN = web3.utils.toBN(expected)
  }
  const diff = actualBN.sub(expectedBN).abs()
  assert(diff.lt(toleranceBN),
        `assert.closeBN( ${actual}, ${expected}, ${toleranceBN} )`
  )
}

describe('generated math points', () => {
  let env
  let bmath
  beforeEach(async () => {
    env = await scene.phase0(web3)
    bmath = await pkg.deploy(web3, env.admin, 'BStub')
  })
  for (const funcname in points.math) {
    pairs = points.math[funcname]
    for (const pair of pairs) {
      if (typeof (pair[0]) === 'string') {
        console.log('WARN: skipping error case')
        continue
      }
      const expected = pair[0]
      const args = pair[1]
      const desc_fmath = `${expected} ?= fmath.${funcname}(${args})`
      let actual
      it(desc_fmath, async () => {
        actual = fmath[funcname](...args)
        assert.closeTo(expected, actual, tolerance)
      })
      const expectedBN = web3.utils.toWei(expected.toString())
      const argsBN = []
      for (arg of args) {
        argsBN.push(web3.utils.toWei(arg.toString()))
      }
      const desc_bmath = `${expectedBN} ?= BMath.${funcname}(${argsBN})`
      let actualBN
      it(desc_bmath, async () => {
        actualBN = await bmath.methods[funcname](...argsBN).call()
        assert.closeBN(actualBN, expectedBN)
      })
      it(`  -> fmath.${funcname}(${args}) ~= bmath.${funcname}(...)`, () => {
        assert.closeBN(actualBN, toBNum(actual))
      })
    }
  }
})
