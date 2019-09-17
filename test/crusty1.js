const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const testPoints = require('./points.js')

const toWei = web3.utils.toWei
const toBN = web3.utils.toBN
const toHex = web3.utils.toHex
const asciiToHex = web3.utils.asciiToHex

const approxTolerance = 10 ** -6
const floatEqTolerance = 10 ** -12
const MAX256 = web3.utils.toTwosComplement('-1')

const assertCloseBN = (a, b, tolerance) => {
  tolerance = toBN(toWei(tolerance))
  const diff = toBN(a).sub(toBN(b)).abs()
  assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`)
}

describe('crusty bpool tests', () => {
  var hub
  var accts
  var acct0; var acct1; var acct2
  var bpool
  var acoin; var bcoin; var ccoin

  // balance of acct0 (for each coin) at start of each test
  const preBindBalance = toWei('1001') // +1 for initial bind
  const initBalance = toWei('1000')

  beforeEach(async () => {
    accts = await web3.eth.getAccounts()
    acct0 = accts[0]
    acct1 = accts[1]
    acct2 = accts[2]

    acoin = await pkg.deploy(web3, acct0, 'TToken')
    bcoin = await pkg.deploy(web3, acct0, 'TToken')
    ccoin = await pkg.deploy(web3, acct0, 'TToken')

    hub = await pkg.deploy(web3, acct0, 'BFactory')

    bpoolAddr = await hub.methods.newBPool().call()
    await hub.methods.newBPool().send({ from: acct0, gas: 0xffffffff })
    bpool = new web3.eth.Contract(JSON.parse(pkg.types.BPool.abi), bpoolAddr)

    for (coin of [acoin, bcoin, ccoin]) {
      await coin.methods.mint(preBindBalance).send({ from: acct0, gas: 0xffffffff })
      for (user of [acct0, acct1, acct2]) {
        await coin.methods.approve(bpool._address, MAX256)
          .send({ from: user })
      }
      await bpool.methods.bind(coin._address, toWei('1'), toWei('1')).send({ from: acct0, gas: 0xffffffff })
    }
    await bpool.methods.start().send({ from: acct0 })
  })

  for (pt of testPoints.calc_InGivenOutPoints) {
    const expected = toWei(pt.res.toString())
    const Bi = toWei(pt.Bi.toString())
    const Wi = toWei(pt.Wi.toString())
    const Bo = toWei(pt.Bo.toString())
    const Wo = toWei(pt.Wo.toString())
    const fee = toWei(pt.fee.toString())
    const Ao = toWei(pt.Ao.toString())
    it(`${pt.res} ~= bpool.swap_ExactAmountOut(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.res},(0),${pt.fee})`, async () => {
      await bpool.methods.setParams(acoin._address, Bi, Wi).send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setParams(bcoin._address, Bo, Wo).send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
        .send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setFee(fee).send({ from: acct0, gas: 0xffffffff })
      var abefore = await acoin.methods.balanceOf(acct0).call()
      var bbefore = await bcoin.methods.balanceOf(acct0).call()
      var resultStatic = await bpool.methods.swap_ExactAmountOut(acoin._address, MAX256, bcoin._address, Ao, '0')
        .call()
      var result = await bpool.methods.swap_ExactAmountOut(acoin._address, MAX256, bcoin._address, Ao, '0')
        .send({ from: acct0, gas: 0xffffffff })
      var aafter = await acoin.methods.balanceOf(acct0).call()
      var bafter = await bcoin.methods.balanceOf(acct0).call()
      var adiff = toBN(abefore).sub(toBN(aafter))
      var bdiff = toBN(bafter).sub(toBN(bbefore))
      assert.equal(adiff, resultStatic.Ai)
      assert.equal(bdiff, Ao)
      assertCloseBN(expected, resultStatic.Ai, approxTolerance.toString())
    })
  }

  for (pt of testPoints.StopOutGivenInPoints) {
    const Ai = toWei(pt.Ai.toString())
    const Bi = toWei(pt.Bi.toString())
    const Wi = toWei(pt.Wi.toString())
    const Bo = toWei(pt.Bo.toString())
    const Wo = toWei(pt.Wo.toString())
    const Lo = toWei(pt.Lo.toString())
    const fee = toWei(pt.fee.toString())
    const expected = toWei(pt.res.toString())
    it(`${pt.res} ~= bpool.swap_ExactAmountIn(${pt.Bi},${pt.Wi},${pt.Bo},${pt.Wo},${pt.Ai},${pt.Lo},(MAX),${pt.fee})`
      , async () => {
        await bpool.methods.setParams(acoin._address, Bi, Wi).send({ from: acct0, gas: 0xffffffff })
        await bpool.methods.setParams(bcoin._address, Bo, Wo).send({ from: acct0, gas: 0xffffffff })
        await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
          .send({ from: acct0, gas: 0xffffffff })
        await bpool.methods.setFee(fee).send({ from: acct0, gas: 0xffffffff })
        var abefore = await acoin.methods.balanceOf(acct0).call()
        var bbefore = await bcoin.methods.balanceOf(acct0).call()
        var resultStatic = await bpool.methods.swap_ExactAmountIn(acoin._address, Ai, bcoin._address, Lo, MAX256)
          .call()
        var result = await bpool.methods.swap_ExactAmountIn(acoin._address, Ai, bcoin._address, Lo, MAX256)
          .send({ from: acct0, gas: 0xffffffff })
        var aafter = await acoin.methods.balanceOf(acct0).call()
        var bafter = await bcoin.methods.balanceOf(acct0).call()
        var adiff = toBN(abefore).sub(toBN(aafter))
        var bdiff = toBN(bafter).sub(toBN(bbefore))
        assert.equal(bdiff, resultStatic.Ao)
        assert.equal(adiff, Ai)
        assertCloseBN(expected, resultStatic.Ao, approxTolerance.toString())
      })
  }

  for (pt of testPoints.MaxInExactOutPoints) {
    const Ao = toWei(pt.Ao.toString())
    const Bi = toWei(pt.Bi.toString())
    const Li = toWei(pt.Li.toString())
    const Wi = toWei(pt.Wi.toString())
    const Bo = toWei(pt.Bo.toString())
    const Wo = toWei(pt.Wo.toString())
    const fee = toWei(pt.fee.toString())
    const expected = toWei(pt.res.toString())
    it(`${pt.res} ~= bpool.swap_ExactAmountOut(${pt.Bi},${pt.Wi},${pt.Li},${pt.Bo},${pt.Wo},${pt.Ao},(0),${pt.fee})`, async () => {
      await bpool.methods.setParams(acoin._address, Bi, Wi).send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setParams(bcoin._address, Bo, Wo).send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setParams(ccoin._address, toWei('10'), toWei('1')) // shouldn't impact calc
        .send({ from: acct0, gas: 0xffffffff })
      await bpool.methods.setFee(fee).send({ from: acct0, gas: 0xffffffff })
      var abefore = await acoin.methods.balanceOf(acct0).call()
      var bbefore = await bcoin.methods.balanceOf(acct0).call()
      var resultStatic = await bpool.methods.swap_ExactAmountOut(acoin._address, MAX256, bcoin._address, Ao, '0')
        .call()
      var result = await bpool.methods.swap_ExactAmountOut(acoin._address, MAX256, bcoin._address, Ao, '0')
        .send({ from: acct0, gas: 0xffffffff })
      var aafter = await acoin.methods.balanceOf(acct0).call()
      var bafter = await bcoin.methods.balanceOf(acct0).call()
      var adiff = toBN(abefore).sub(toBN(aafter))
      var bdiff = toBN(bafter).sub(toBN(bbefore))
      assert.equal(adiff, resultStatic.Ai)
      assert.equal(bdiff, Ao)
      assertCloseBN(expected, resultStatic.Ai, approxTolerance.toString())
    })
  }

  it('setup sanity checks', async () => {
    const paused = await bpool.methods.isPaused().call()
    assert(!paused, 'pool not started (unpaused)')
    var bound = await bpool.methods.isBound(acoin._address).call()
    assert(bound, 'acoin not bound')
    assert.equal(initBalance, (await acoin.methods.balanceOf(acct0).call()), 'acoin wrong init balance')
    assert.equal(initBalance, (await bcoin.methods.balanceOf(acct0).call()), 'bcoin wrong init balance')
    assert.equal(initBalance, (await ccoin.methods.balanceOf(acct0).call()), 'ccoin wrong init balance')
  })
  it('bind', async () => {
    numBound = await bpool.methods.getNumTokens().call()
    assert.equal(3, numBound)
  })
  it('can transfer tokens', async () => {
    var sent = toWei('10')
    await acoin.methods.transfer(acct1, sent)
      .send({ from: acct0 })
    var bal = await acoin.methods.balanceOf(acct1)
      .call()
    assert.equal(sent, bal)
  })
  it('setParams basics', async () => {
    const AWeight = toWei('1.5')
    const ABalance = toWei('100')
    const BWeight = toWei('2.5')
    const BBalance = toWei('50')
    const aBalBefore = await bpool.methods.getBalance(acoin._address).call()
    assert.equal(aBalBefore, toWei('1'))
    await bpool.methods.setParams(acoin._address, ABalance, AWeight)
      .send({ from: acct0, gas: 0xffffffff })
    const aweight = await bpool.methods.getDenormalizedWeight(acoin._address).call()
    const abalance = await bpool.methods.getBalance(acoin._address).call()
    assert.equal(AWeight, aweight, 'wrong weight after setting')
    assert.equal(ABalance, abalance, 'wrong balance after setting')
    assert.equal(ABalance, (await acoin.methods.balanceOf(bpool._address).call()), 'wrong bpool acoin balance')
    assert.equal(preBindBalance - ABalance,
      (await acoin.methods.balanceOf(acct0).call()), 'wrong initBalance - ABalanceBound')
  })
})
