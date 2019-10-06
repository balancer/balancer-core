const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('bpool basic lifecycle / truffle meta tests', async (accounts) => {
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
    console.log('before all');
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);
    console.log("POOL", POOL);

    await tokens.build(toHex("DIRT"));
    DIRT = await tokens.get.call(toHex("DIRT"));
    console.log("DIRT", DIRT);
    dirt = await TToken.at(DIRT);

    await dirt.mint(MAX);
    await dirt.approve(POOL, MAX);

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
  });

  beforeEach(async () => {
  });

  it('admin == accounts[0] == controller and factory.isBPool(pool)', async () => {
    assert.equal(admin, accounts[0])
    const controller = await pool.getController.call();
    assert.equal(admin, controller);
    const isPool = await factory.isBPool(POOL);
    assert(isPool);
  });

  it('admin has DIRT and admin approves POOL to use DIRT', async()=>{
    const bal = await dirt.balanceOf.call(admin);
    assert(bal.gt(0));
    const allowance = await dirt.allowance.call(admin, POOL);
    assert(allowance.gt(0));
  });

});
