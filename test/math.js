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

  const rockBalance = toWei('55')
  const rockDenorm = toWei('2.4');

  const sandBalance = toWei('101')
  const sandDenorm = toWei('3.7');

  const swapFee = toWei('0.01');
  const exitFee = toWei('0.01');

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

    await tokens.build(toHex("SAND"));
    SAND = await tokens.get.call(toHex("SAND"));
    sand = await TToken.at(SAND);
    console.log(`sand := tokens.build('SAND')`);

    await dirt.mint(MAX);
    console.log("dirt.mint(MAX);");
    await dirt.approve(POOL, MAX);
    console.log("dirt.approve(POOL, MAX);");

    await rock.mint(MAX);
    console.log("rock.mint(MAX);");
    await rock.approve(POOL, MAX);
    console.log("rock.approve(POOL, MAX);");

    await sand.mint(MAX);
    console.log("sand.mint(MAX);");
    await sand.approve(POOL, MAX);
    console.log("sand.approve(POOL, MAX);");

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.bind(DIRT, ${dirtBalance}, ${dirtDenorm})`);

    await pool.bind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.bind(ROCK, ${rockBalance}, ${rockDenorm})`);

    await pool.bind(SAND, sandBalance, sandDenorm);
    console.log(`pool.bind(SAND, ${sandBalance}, ${sandDenorm})`);

    await pool.setPublicSwap(true);
    console.log('pool.setPublicSwap(true);');
    await pool.setPublicJoin(true);
    console.log('pool.setPublicJoin(true);');
  });

  beforeEach(async () => {
    await pool.rebind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.rebind(DIRT, ${dirtBalance}, ${dirtDenorm})`);
    await pool.rebind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.rebind(ROCK, ${rockBalance}, ${rockDenorm})`);
    await pool.rebind(SAND, sandBalance, sandDenorm);
    console.log(`pool.rebind(SAND, ${sandBalance}, ${sandDenorm})`);
    await pool.setFees(swapFee, exitFee);
    console.log(`pool.setFees(${swapFee},${exitFee})`);
  });

  it('swap_ExactAmountIn');

  it('swap_ExactAmountOut');
  it('swap_ExactAmountOut ERR_MAX_OUT_RATIO ERR_ARG_LIMIT_IN ERR_LIMIT_OUT ERR_LIMIT_PRICE');

  it('swap_ExactMarginalPrice');
  it('swap_ExactMarginalPrice ERR_MAX_OUT_RATIO ERR_ARG_LIMIT_PRICE ERR_LIMIT_OUT ERR_LIMIT_PRICE');

  it('joinPool');
  it('exitPool');

  it('joinswap_ExternAmountIn');
  it('joinswap_PoolAmountOut');
  it('exitswap_PoolAmountIn');
  it('exitswap_ExternAmountOut');


});
