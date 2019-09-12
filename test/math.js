assert = require('chai').assert
const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()
let math = require('../util/floatMath.js')
const fMath = math.floatMath

const testPoints = require('./points.js')

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const approxTolerance = 10 ** -6
const floatEqTolerance = 10 ** -12

const toBN = web3.utils.toBN
const toWei = (n) => web3.utils.toWei(n.toString())

const assertCloseBN = (a, b, tolerance) => {
  tolerance = toBN(toWei(tolerance))
  const diff = toBN(a).sub(toBN(b)).abs()
  assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`)
}

describe('floatMath.js', function () {
  for (const pt of testPoints.spotRatePoints) {
    var desc = `${pt.res} ~= calc_SpotRate(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.calc_SpotRate(pt.Bi, pt.Wi, pt.Bo, pt.Wo), floatEqTolerance)
    })
  }

  for (const pt of testPoints.calc_InGivenOutPoints) {
    var desc = `${pt.res} == calc_InGivenOutExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.calc_InGivenOutExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
        , floatEqTolerance)
    })
  }

  for (const pt of testPoints.calc_InGivenOutPoints) {
    var desc = `${pt.res} ~= calc_InGivenOutApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.calc_InGivenOutApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
        , approxTolerance)
    })
  }

  for (const pt of testPoints.amountUpToPricePoints) {
    var desc = `${pt.res} ~= amountUpToPriceExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.amountUpToPriceExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
        , approxTolerance)
    })
  }
  for (const pt of testPoints.amountUpToPricePoints) {
    var desc = `${pt.res} ~= amountUpToPriceApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.amountUpToPriceApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
        , approxTolerance)
    })
  }
  for (const pt of testPoints.powPoints) {
    var desc = `${pt.res} ~= powApprox(${pt.base}, ${pt.exp})`
    it(desc, function () {
      assert.closeTo(pt.res, fMath.powApprox(pt.base, pt.exp)
        , approxTolerance)
    })
  }

  for (const pt of testPoints.valuePoints) {
    const tokens = pt.tokens
    const res = pt.res
    var desc = `${res} ~= getValue(${tokens})`
    it(desc, function () {
      assert.closeTo(res, fMath.getValue(tokens)
        , approxTolerance)
    })
  }

  for (const pt of testPoints.refSpotPricePoints) {
    const tokens = pt.tokens
    const Bo = tokens[0][0]
    const Wo = tokens[0][1]
    const res = pt.res
    var desc = `${res} ~= getRefSpotPrice(Bo, Wo, ${tokens})`
    it(desc, function () {
      assert.closeTo(res, fMath.getRefSpotPrice(Bo, Wo, tokens)
        , approxTolerance)
    })
  }

  for (const pt of testPoints.normalizedWeightPoints) {
    const tokens = pt.tokens
    const W = tokens.length > 0 ? tokens[0][1] : 0
    const res = pt.res
    var desc = `${res} ~= getNormalizedWeight(W, ${tokens})`
    it(desc, function () {
      assert.closeTo(res, fMath.getNormalizedWeight(W, tokens)
        , approxTolerance)
    })
  }

  it('powApprox approximate float precision range', () => {
    for (base = 1.95; base > 0.05; base *= 0.95) {
      for (exponent = 10; exponent > 0.1; exponent *= 0.95) {
        assert.closeTo(base ** exponent
          , fMath.powApprox(base, exponent)
          , 0.001
          , `base: ${base}, exponent: ${exponent}`)
      }
    }
  })

  it('should throw if Ai >= Bi', () => {
    assert.throws(() => { fMath.swapIMathExact(1, 2, 2, 2, 1, 0) })
  })
  it('should throw if fee >= 1', () => {
    assert.throws(() => { fMath.swapIMathExact(2, 2, 2, 2, 2, 1) })
  })
  it('should throw if any arg except fee is 0', () => {
    assert.throws(() => { fMath.swapIMathExact(0, 1, 1, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathExact(1, 0, 1, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathExact(1, 1, 0, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 0, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 1, 0, 0) })
    assert.throws(() => { fMath.swapIMathApprox(0, 1, 1, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathApprox(1, 0, 1, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathApprox(1, 1, 0, 1, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 0, 0.1, 0) })
    assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 1, 0, 0) })
  })
})

describe('BMath', () => {
  for (const pt of testPoints.powPoints) {
    const desc = `${pt.res} ~= math.bpow(${pt.base}, ${pt.exp})`
    it(desc, async () => {
      const accts = await web3.eth.getAccounts()
      const math = await pkg.deploy(web3, accts[0], 'BStub')
      const base = toWei(pt.base).toString()
      const exp = toWei(pt.exp).toString()
      var actual = await math.methods.calc_bpow(base, exp).call()
      assertCloseBN(toWei(pt.res), web3.utils.toBN(actual), approxTolerance)
    })
  }
  for (const pt of testPoints.spotRatePoints) {
    const res = toWei(pt.res)
    const Bi = toWei(pt.Bi).toString()
    const Wi = toWei(pt.Wi).toString()
    const Bo = toWei(pt.Bo).toString()
    const Wo = toWei(pt.Wo).toString()
    const desc = `${pt.res} ~= bMath.calc_SpotRate(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`
    it(desc, async () => {
      const accts = await web3.eth.getAccounts()
      const math = await pkg.deploy(web3, accts[0], 'BStub')
      var actual = await math.methods.calc_SpotRate(Bi, Wi, Bo, Wo).call()
      assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance)
    })
  }

  for (const pt of testPoints.amountUpToPricePoints) {
    const res = toWei(pt.res)
    const SER1 = toWei(pt.SER1).toString()
    const Bi = toWei(pt.Bi).toString()
    const Wi = toWei(pt.Wi).toString()
    const Bo = toWei(pt.Bo).toString()
    const Wo = toWei(pt.Wo).toString()
    const fee = toWei(pt.fee).toString()
    const desc = `${pt.res} ~= bMath.calc_InGivenPrice(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`
    it(desc, async () => {
      const accts = await web3.eth.getAccounts()
      const math = await pkg.deploy(web3, accts[0], 'BStub')
      var actual = await math.methods.calc_InGivenPrice(Bi, Wi, Bo, Wo, SER1, fee).call()
      assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance)
    })
  }

  for (const pt of testPoints.calc_InGivenOutPoints) {
    const res = toWei(pt.res)
    const Bi = toWei(pt.Bi).toString()
    const Wi = toWei(pt.Wi).toString()
    const Bo = toWei(pt.Bo).toString()
    const Wo = toWei(pt.Wo).toString()
    const Ao = toWei(pt.Ao).toString()
    const fee = toWei(pt.fee).toString()
    var desc = `${pt.res} ~= bMath.calc_InGivenOutPoints(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`
    it(desc, async () => {
      accts = await web3.eth.getAccounts()
      math = await pkg.deploy(web3, accts[0], 'BStub')
      var actual = await math.methods.calc_InGivenOut(Bi, Wi, Bo, Wo, Ao, fee).call()
      assertCloseBN(res, web3.utils.toBN(actual), approxTolerance)
    })
  }
})
