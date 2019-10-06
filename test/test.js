const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('bpool basic lifecycle / truffle meta tests', async (accts) => {
  const admin = accts[0];
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
    console.log("token factory", tokens);
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);
    console.log("POOL", POOL);

    await tokens.build(toHex("DIRT"));
    DIRT = await tokens.get.call(toHex("DIRT"));
    console.log("DIRT", DIRT);
    dirt = await TToken.at(DIRT);

    await dirt.approve(POOL, MAX);

    await pool.bind(POOL, dirtBalance, dirtDenorm);

  });

  beforeEach(async () => {
    console.log('before each');
  });

  it('runs a test', async () => {
    console.log('hello');
  });

/*
  it('deployed with accts[0], which is now controller', async () => {
    const controller = await pool.getController.call();
    assert.equal(admin, controller);
  });

  it('we have test tokens available', async()=>{
    const bal = await rock.balanceOf(admin);
    assert(bal.gt(0));

  });
*/
});
