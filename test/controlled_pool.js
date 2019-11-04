const { assertThrow } = require('../lib/tests/assertThrow')
const truffleAssert = require('truffle-assertions');
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('BPool', async (accounts) => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const toHex = web3.utils.toHex;
  const toBN = web3.utils.toBN;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;
  const errorDelta = 0.000001
  const MAX = web3.utils.toTwosComplement(-1);

  let tokens;           // token factory / registry
  let AAA, BBB, CCC, DDD, EEE, FFF, GGG, HHH, ZZZ; // addresses
  let aaa, bbb, ccc, ddd, eee, fff, ggg, hhh, zzz; // TTokens
  let factory;          // BPool factory
  let pool;             // first pool w/ defaults
  let POOL;             //   pool address

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);

    await tokens.build(toHex("AAA"));
    await tokens.build(toHex("BBB"));
    await tokens.build(toHex("CCC"));
    await tokens.build(toHex("DDD"));
    await tokens.build(toHex("EEE"));
    await tokens.build(toHex("FFF"));
    await tokens.build(toHex("GGG"));
    await tokens.build(toHex("HHH"));
    await tokens.build(toHex("ZZZ"));


    AAA = await tokens.get.call(toHex("AAA"));
    BBB = await tokens.get.call(toHex("BBB"));
    CCC = await tokens.get.call(toHex("CCC"));
    DDD = await tokens.get.call(toHex("DDD"));
    EEE = await tokens.get.call(toHex("EEE"));
    FFF = await tokens.get.call(toHex("FFF"));
    GGG = await tokens.get.call(toHex("GGG"));
    HHH = await tokens.get.call(toHex("HHH"));
    ZZZ = await tokens.get.call(toHex("ZZZ"));

    aaa = await TToken.at(AAA);
    bbb = await TToken.at(BBB);
    ccc = await TToken.at(CCC);
    ddd = await TToken.at(DDD);
    eee = await TToken.at(EEE);
    fff = await TToken.at(FFF);
    ggg = await TToken.at(GGG);
    hhh = await TToken.at(HHH);
    zzz = await TToken.at(ZZZ);

    // Admin balances
    await aaa.mint(toWei('100'));
    await bbb.mint(toWei('100'));
    await ccc.mint(toWei('100'));
    await ddd.mint(toWei('100'));
    await eee.mint(toWei('100'));
    await fff.mint(toWei('100'));
    await ggg.mint(toWei('100'));
    await hhh.mint(toWei('100'));
    await zzz.mint(toWei('100'));

  });

  describe('Binding Tokens', () => {


    it('Admin approves tokens', async () => {
      await aaa.approve(POOL, MAX);
      await bbb.approve(POOL, MAX);
      await ccc.approve(POOL, MAX);
      await ddd.approve(POOL, MAX);
      await eee.approve(POOL, MAX);
      await fff.approve(POOL, MAX);
      await ggg.approve(POOL, MAX);
      await hhh.approve(POOL, MAX);
      await zzz.approve(POOL, MAX);
    });

    it('Admin binds tokens', async () => {
      
      await pool.bind(AAA, toWei('50'), toWei('1'));
      await pool.bind(BBB, toWei('50'), toWei('3'));
      await pool.bind(CCC, toWei('50'), toWei('2.5'));
      await pool.bind(DDD, toWei('50'), toWei('7'));
      await pool.bind(EEE, toWei('50'), toWei('10'));
      await pool.bind(FFF, toWei('50'), toWei('1.99'));
      await pool.bind(GGG, toWei('50'), toWei('6'));
      await pool.bind(HHH, toWei('50'), toWei('2.1'))
      
      let totalDernomWeight = await pool.getTotalDenormalizedWeight();
      assert.equal(33.59, fromWei(totalDernomWeight));
    });

    it('Fails binding more than 8 tokens', async () => {
      await assertThrow(pool.bind(ZZZ, toWei('50'), toWei('2')), 'ERR_MAX_TOKENS');
    });

  });


});
