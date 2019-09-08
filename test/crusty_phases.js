const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

// phase0:
//  env.admin = accts[0]
//  user1-2 = accts[1-2]
//  factory = new factory
module.exports.phase0 = async (web3) => {
  const env = {}
  env.accts = await web3.eth.getAccounts()
  env.admin = env.accts[0]
  env.user1 = env.accts[1]
  env.user2 = env.accts[2]
  const deploy = (w, a, t) => pkg.deploy(web3, env.admin, t)
  env.factory = await deploy(web3, env.admin, 'BFactory')
  return env
}

// phase1:
//  bpool = new bpool
//  poolcoin = bpool.getPoolToken
//  acoin,bcoin,ccoin = new btokens
//  *coin.mint( MAX )
//    --> *coin.balance == MAX
//  *coin.approve(bpool)
module.exports.phase1 = async (web3) => {
  const env = await module.exports.phase0(web3)
  const deploy = (w, a, t) => pkg.deploy(web3, env.admin, t)
  var fn_newBPool = await env.factory.methods.newBPool()
  const bpoolAddr = await fn_newBPool.call()
  env.bpool = new web3.eth.Contract(JSON.parse(pkg.types.BPool.abi), bpoolAddr)
  await fn_newBPool.send({ from: env.admin, gas: 0xffffffff })
  const poolcoinAddr = env.bpool._address
  env.poolcoin = new web3.eth.Contract(JSON.parse(pkg.types.TToken.abi), poolcoinAddr)

  env.acoin = await pkg.deploy(web3, env.admin, 'TToken')
  env.bcoin = await pkg.deploy(web3, env.admin, 'TToken')
  env.ccoin = await pkg.deploy(web3, env.admin, 'TToken')

  env.acoin.methods.mint(web3.utils.toTwosComplement('-1')).send({ from: env.admin, gas: 5000000 })
  env.bcoin.methods.mint(web3.utils.toTwosComplement('-1')).send({ from: env.admin, gas: 5000000 })
  env.ccoin.methods.mint(web3.utils.toTwosComplement('-1')).send({ from: env.admin, gas: 5000000 })

  env.acoin.methods.approve(env.bpool._address, web3.utils.toTwosComplement('-1'))
    .send({ from: env.admin })
  env.bcoin.methods.approve(env.bpool._address, web3.utils.toTwosComplement('-1'))
    .send({ from: env.admin })
  env.ccoin.methods.approve(env.bpool._address, web3.utils.toTwosComplement('-1'))
    .send({ from: env.admin })

  return env
}

module.exports.phase2 = async (web3) => {
  const env = await module.exports.phase1(web3)
  const deploy = (w, a, t) => pkg.deploy(web3, env.admin, t)

  env.initWeight = web3.utils.toWei('10')
  env.initBalance = web3.utils.toWei('10')

  await env.bpool.methods.bind(env.acoin._address, env.initBalance, env.initWeight)
    .send({ from: env.admin, gas: 0xffffffff })
  await env.bpool.methods.bind(env.bcoin._address, env.initBalance, env.initWeight)
    .send({ from: env.admin, gas: 0xffffffff })
  await env.bpool.methods.bind(env.ccoin._address, env.initBalance, env.initWeight)
    .send({ from: env.admin, gas: 0xffffffff })

  await env.bpool.methods.start()
    .send({ from: env.admin, gas: 0xffffffff })

  return env
}

module.exports.phase3 = async (web3) => {
  const env = await module.exports.phase2(web3)
  const deploy = (w, a, t) => pkg.deploy(web3, env.admin, t)

  for (user of [env.admin, env.user1, env.user2]) {
    for (coin of [env.acoin, env.bcoin, env.ccoin]) {
      await coin.methods.transfer(user, env.initBalance)
        .send({ from: env.admin })
      // DSToken MAX_U256 means infinite allowance
      await coin.methods.approve(env.bpool._address, web3.utils.toTwosComplement('-1'))
        .send({ from: user })
    }
    await env.poolcoin.methods.approve(env.bpool._address, web3.utils.toTwosComplement('-1'))
      .send({ from: user })
  }
  return env
}
