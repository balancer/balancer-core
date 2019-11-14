const { assertThrow } = require('../lib/tests/assertThrow');
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('BFactory', async (accounts) => {
  const admin = accounts[0];
  const nonAdmin = accounts[1];
  const user2 = accounts[2];
  const toHex = web3.utils.toHex;
  const toBN = web3.utils.toBN;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;
  const hexToUtf8 = web3.utils.hexToUtf8;

  const MAX = web3.utils.toTwosComplement(-1);

  describe('Factory', () => {
    let factory;
    let pool;
    let POOL;

    before(async () => {
      expect(admin).not.to.equal(nonAdmin);
      tokens = await TTokenFactory.deployed();
      factory = await BFactory.deployed();

      await tokens.build(toHex("WETH"));
      await tokens.build(toHex("DAI"));

      WETH = await tokens.get.call(toHex("WETH"));
      DAI = await tokens.get.call(toHex("DAI"));

      weth = await TToken.at(WETH);
      dai = await TToken.at(DAI);

      // Admin balances
      await weth.mint(toWei('5'));
      await dai.mint(toWei('200'));

      // nonAdmin balances
      await weth.mint(toWei('1'), { from: nonAdmin });
      await dai.mint(toWei('50'), { from: nonAdmin });

      POOL = await factory.newBPool.call(); // this works fine in clean room
      await factory.newBPool();
      pool = await BPool.at(POOL);

      await weth.approve(POOL, MAX);
      await dai.approve(POOL, MAX);

      await weth.approve(POOL, MAX, { from: nonAdmin });
      await dai.approve(POOL, MAX, { from: nonAdmin });
    });

    it('BFactory is bronze release', async () => {
      let color = await factory.getColor();
      assert.equal(hexToUtf8(color), 'BRONZE');
    });

    it('isBPool on non pool returns false', async () => {
      let isBPool = await factory.isBPool(admin);
      assert.isFalse(isBPool)
    });

    it('isBPool on pool returns true', async () => {
      let isBPool = await factory.isBPool(POOL);
      assert.isTrue(isBPool)
    });

    it('fails nonAdmin calls collect', async () => {
      await assertThrow(factory.collect(nonAdmin, { from: nonAdmin }), "ERR_NOT_BLABS");
    });

    it('admin collects fees', async () => {
      await pool.bind(WETH, toWei('5'), toWei('5'));
      await pool.bind(DAI, toWei('200'), toWei('5'));

      await pool.finalize(toWei('100'));

      await pool.joinPool(toWei('10'), { from: nonAdmin });
      await pool.exitPool(toWei('10'), { from: nonAdmin });

      await factory.collect(POOL);

      let adminBalance = await pool.balanceOf(admin);
      
      assert.equal(fromWei(adminBalance), '100.001');

    });

    it('nonadmin cant set blabs address', async () => {
      await assertThrow(factory.setBLabs(nonAdmin, { from: nonAdmin }), "ERR_NOT_BLABS");
    });

    it('admin changes blabs address', async () => {
      await factory.setBLabs(user2);
      let blab = await factory.getBLabs();
      assert.equal(blab, user2);
    });

  });

});
