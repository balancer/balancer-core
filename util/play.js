const assert = require('assert')
const Web3 = require('web3') // utils only
const toWei = Web3.utils.toWei

const t = require('./twrap.js')
const types_ = require('./types.js')
types_.loadTestTypes()

let env
let staged = false

module.exports.stage = async (web3_, accts_) => {
  env = {}
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

module.exports.scene1 = async () => {
  assert(staged, 'please call `stage`')
  staged = false

  const TToken = new t.TType(env.web3, env.types, 'TToken')

  env.ETH = await TToken.deploy()
  env.DAI = await TToken.deploy()
  env.MKR = await TToken.deploy()

  const BFactory = new t.TType(env.web3, env.types, 'BFactory')

  env.hub = await BFactory.deploy()
  env.bpool = await env.hub.newBPool()

  for (const user of [env.Ali, env.Bob, env.Cat]) {
    for (const coin of [env.ETH, env.DAI, env.MKR]) {
      env.web3.opts.from = user
      await coin.approve(env.bpool.__address, env.MAX)
    }
  }
  env.web3.opts.from = env.Ali

  return env
}

module.exports.scene2 = async () => {
  await module.exports.scene1()

  env.initDAI = toWei('5000')
  env.initETH = toWei('40')
  env.initMKR = toWei('10')

  await env.MKR.mint(env.initMKR)
  await env.ETH.mint(env.initETH)
  await env.DAI.mint(env.initDAI)

  await env.bpool.bind(env.MKR.__address, toWei('10'), toWei('1.1'))
  await env.bpool.bind(env.ETH.__address, toWei('40'), toWei('1.1'))
  await env.bpool.bind(env.DAI.__address, toWei('5000'), toWei('1.1'))

  await env.bpool.start()

  return env
}

module.exports.scene3 = async () => {
  await module.exports.scene2()

  return env
}
