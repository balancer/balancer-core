const assert = require('chai').assert;

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('BPool lifecycle', async (accounts) => {

  const admin = accounts[0];
  const toHex = web3.utils.toHex;
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

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);
    console.log("pool is ", POOL);

    await tokens.build(toHex("DIRT"));
    DIRT = await tokens.get.call(toHex("DIRT"));
    dirt = await TToken.at(DIRT);
    console.log("dirt is ", DIRT);

    await dirt.mint(MAX);
    console.log("dirt.mint(MAX);");
    await dirt.approve(POOL, MAX);
    console.log("dirt.approve(POOL, MAX);");
  });

  it('bind getNumTokens isBound', async () => {
    let isBound = await pool.isBound.call(DIRT);
    let numTokens = await pool.getNumTokens.call();
    assert( ! isBound);
    assert.equal(0, numTokens);

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    console.log("pool.bind(DIRT, dirtBalance, dirtDenorm);");

    isBound = await pool.isBound.call(DIRT);
    numTokens = await pool.getNumTokens.call();
    assert(isBound);
    assert.equal(1, numTokens);
  });

  it('bind getTotalDenormalizedWeight getTotalNormalizedWeight');

  it('bind getGetCurrentTokens');

  it('bind ERR_NOT_CONTROLLER ERR_IS_BOUND ERR_IS_FINALIZED');

  it('bind ERR_MAX_TOTAL_WEIGHT ERR_MAX_TOKENS');

  it('unbind getNumTokens isBound', async () => {
    let isBoundBefore = await pool.isBound.call(DIRT);
    let numTokensBefore = await pool.getNumTokens.call();
    assert(isBoundBefore);
    await pool.unbind(DIRT);
    let isBoundAfter = await pool.isBound.call(DIRT);
    assert(!isBoundAfter);
    let numTokensAfter = await pool.getNumTokens.call();
    assert.equal(numTokensAfter, numTokensBefore - 1);
  });

  it('unbind ERR_NOT_CONTROLLER ERR_NOT_BOUND');

  it('rebind getBalance getWeight', async () => {
    await pool.bind(DIRT, toWei('10'), toWei('1.2'));
    assert.equal(toWei('10'), await pool.getBalance.call(DIRT));
    assert.equal(toWei('1.2'), await pool.getDenormalizedWeight.call(DIRT));

    await pool.rebind(DIRT, toWei('12'), toWei('1.1'));
    assert.equal(toWei('12'), await pool.getBalance.call(DIRT));
    assert.equal(toWei('1.1'), await pool.getDenormalizedWeight.call(DIRT));

  });

  it('ERR_NOT_BOUND getters')

  it('rebind getTotalDenormalizedWeight getTotalNormalizedWeight');

  it('rebind ERR_NOT_CONTROLLER ERR_NOT_BOUND ERR_IS_FINALIZED');

  it('rebind ERR_MIN_WEIGHT ERR_MAX_WEIGHT ERR_MIN_BALANCE ERR_MAX_BALANCE');

  it('rebind ERR_MAX_TOTAL_WEIGHT ERR_MAX_TOKENS');

  it('rebind ERR_BTOKEN_UNDERFLOW ERR_ERC20_FALSE');

  it('setFees getFees');

  it('setFees ERR_NOT_CONTROLLER ERR_MAX_FEE ERR_FINALIZED');

  it('setController getController');

  it('setController ERR_NOT_CONTROLLER ERR_FINALIZED');

  it('setPublicJoin setPublicSwap isPublicJoin isPublicSwap');

  it('setPublicJoin setPublicSwap ERR_NOT_CONTROLLER ERR_IS_FINALIZED');

  it('setPublicExit ERR_EXIT_ALWAYS_PUBLIC');

  it('finalize isFinalized getCurrentTokens getFinalTokens');

  it('finalize ERR_NOT_CONTROLLER ERR_IS_FINALIZED ERR_MIN_POOL_SUPPLY');

  it('collect');

  it('collect ERR_NOT_FACTORY');

  it('gulp');

  it('testtesttest');

  it('swap_ExactAmountIn ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC');
  it('swap_ExactAmountOut ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC');
  it('swap_ExactMarginalPrice ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC');

  it('joinPool ERR_NOT_BOUND ERR_NOT_FINALIZED ERR_JOIN_NOT_PUBLIC');
  it('exitPool ERR_NOT_BOUND ERR_NOT_FINALIZED');
  it('joinswap_ExternAmountIn ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC ERR_JOIN_NOT_PUBLIC');
  it('joinswap_PoolAmountOut ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC ERR_JOIN_NOT_PUBLIC');
  it('exitswap_ExternAmountOut ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC');
  it('exitswap_PoolAmountIn ERR_NOT_BOUND ERR_SWAP_NOT_PUBLIC');


});
