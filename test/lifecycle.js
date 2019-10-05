const BPool = artifacts.require('BPool');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('bpool basic lifecycle / truffle meta tests', async (accts) => {
  const admin = accts[0];
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
