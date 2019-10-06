const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('math tests from canonical setup', async (accounts) => {
  const admin = accounts[0];
  const toHex = web3.utils.toHex;
  const toBN = web3.utils.toBN;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;

  const MAX = web3.utils.toTwosComplement(-1);

  let tokens;           // token factory / registry
  let DIRT, ROCK, SAND; // addresses
  let dirt, rock, sand; // TTokens
  let factory;          // BPool factory
  let pool;             // first pool w/ defaults
  let POOL;             //   pool address

  const dirtBalance = toWei('10')
  const dirtDenorm = toWei('1.1');

  const rockBalance = toWei('50')
  const rockDenorm = toWei('2.4');

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);
    console.log(`pool := factory.newBPool()`);

    await tokens.build(toHex("DIRT"));
    DIRT = await tokens.get.call(toHex("DIRT"));
    dirt = await TToken.at(DIRT);
    console.log(`dirt := tokens.build('DIRT')`);

    await tokens.build(toHex("ROCK"));
    ROCK = await tokens.get.call(toHex("ROCK"));
    rock = await TToken.at(ROCK);
    console.log(`rock := tokens.build('ROCK')`);

    await dirt.mint(MAX);
    console.log("dirt.mint(MAX);");
    await dirt.approve(POOL, MAX);
    console.log("dirt.approve(POOL, MAX);");

    await rock.mint(MAX);
    console.log("rock.mint(MAX);");
    await rock.approve(POOL, MAX);
    console.log("rock.approve(POOL, MAX);");

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.bind(DIRT, ${dirtBalance}, ${dirtDenorm})`);

    await pool.bind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.bind(ROCK, ${rockBalance}, ${rockDenorm})`);

    await pool.setSwapAccess(true);
    console.log('pool.setSwapAccess(true);');
  });

  beforeEach(async () => {
    await pool.rebind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.rebind(DIRT, ${dirtBalance}, ${dirtDenorm})`);
    await pool.rebind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.rebind(ROCK, ${rockBalance}, ${rockDenorm})`);
  });

  it('swap_ExactAmountIn', async () => {
    let ret = await pool.swap_ExactAmountIn.call(DIRT, toWei('2.5'), ROCK, '0', MAX);
    await pool.swap_ExactAmountIn(DIRT, toWei('2.5'), ROCK, '0', MAX);
    console.log(`pool.swap_ExactAmountIn(DIRT, ${toWei('2.5')}, ROCK, 0, MAX);`);
    console.log(` -> ( ${ret[0]} , ${ret[1]} )`);
  });

});
