const assert = require('assert')
const Web3 = require('web3') // utils only
const toWei = Web3.utils.toWei

const t = require('./twrap.js')
const types_ = require('./types.js')
types_.loadTestTypes()

let staged = false
let env = {}

module.exports.stage = async (web3_, accts_) => {
  env.web3 = web3_
  env.MAX = Web3.utils.hexToNumberString(Web3.utils.toTwosComplement('-1'))
  if (accts_ === undefined) {
    accts_ = await env.web3.eth.getAccounts()
  }

  env.types = types_

  env.accts = accts_
  env.Ali = env.accts[0]
  env.Bob = env.accts[1]
  env.Cat = env.accts[1]

  env.web3.opts = {
    from: env.Ali,
    gas: 7000000
  }

  staged = true
  return env
}

module.exports.scene0 = async () => {
  assert(staged, 'please call `stage`')
  staged = false

  const TToken = new t.TType(env.web3, env.types, 'TToken')

  env.ETH = await TToken.deploy()
  env.DAI = await TToken.deploy()
  env.MKR = await TToken.deploy()

  const BFactory = new t.TType(env.web3, env.types, 'BFactory')

  env.factory = await BFactory.deploy()
  env.bpool = await env.factory.newBPool()

  for (const user of [env.Ali, env.Bob, env.Cat]) {
    for (const coin of [env.ETH, env.DAI, env.MKR]) {
      env.web3.opts.from = user
      await coin.approve(env.bpool.__address, env.MAX)
    }
  }
  env.web3.opts.from = env.Ali

  env.initMKR = toWei('10')
  env.initETH = toWei('40')
  env.initDAI = toWei('5000')

  await env.MKR.mint(env.initMKR)
  await env.ETH.mint(env.initETH)
  await env.DAI.mint(env.initDAI)

  await env.bpool.bind(env.MKR.__address, env.initMKR, toWei('1.1'))
  await env.bpool.bind(env.ETH.__address, env.initETH, toWei('1.1'))
  await env.bpool.bind(env.DAI.__address, env.initDAI, toWei('1.1'))

  await env.bpool.start()
  return env
}

module.exports.scene1 = async () => {
  check = async (toki, toko, args, errstr) => {
    let Bi = await env.bpool.getBalance(toki.__address);
    let Wi = await env.bpool.getWeight(toki.__address);
    let Bo = await env.bpool.getBalance(toko.__address);
    let Wo = await env.bpool.getWeight(toko.__address);
    assert.equal(Bi, toWei(args[0].toString()));
    assert.equal(Wi, toWei(args[1].toString()));
    assert.equal(Bo, toWei(args[2].toString()));
    assert.equal(Wo, toWei(args[3].toString()));
  }

  await env.bpool.setParams(env.MKR.__address, toWei('4'), toWei('1000'));
  await env.bpool.setParams(env.DAI.__address, toWei('12'), toWei('1000'));
  await check(env.MKR, env.DAI, [4, 1000, 12, 1000])



  return env
}
