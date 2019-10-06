const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('bpool basic lifecycle / truffle meta tests', async (accts) => {
  const admin = accts[0];
  const toHex = web3.utils.toHex;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;

  const MAX = toWei(web3.utils.toTwosComplement(-1));

  let tokens;           // token factory / registry
  let DIRT, ROCK, SAND; // addresses
  let dirt, rock, sand; // TTokens
  let factory;          // BPool factory
  let pool;             // first pool w/ defaults

  before(async () => {
    const tokens = await TTokenFactory.deployed();
    const bpool = await BPool.deployed();
    
    ROCK = await tokens.get.call(toHex("ROCK"));
    rock = await TToken.at(ROCK);

    DIRT = await tokens.get.call(toHex("DIRT"));
    dirt = await TToken.at(DIRT);

    SAND = await tokens.get.call(toHex("SAND"));
    sand = await TToken.at(SAND);

    await rock.approve(pool, MAX);
  });

  beforeEach(async () => {
  });

  it('deployed with accts[0], which is now controller', async () => {
    const bpool = await BPool.deployed();
    const controller = await bpool.getController.call();
    assert.equal(admin, controller);
  });
  it('we have test tokens available', async()=>{
    const tokens = await TTokenFactory.deployed();
    const ROCK = await tokens.get.call(web3.utils.toHex("ROCK"));
    const rock = await TToken.at(ROCK);
    const bal = await rock.balanceOf(admin);
    assert(bal.gt(0));
  });
});
