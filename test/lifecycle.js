const BPool = artifacts.require('BPool');

contract('bpool basic lifecycle / truffle meta tests', async (accts) => {
  it('deployed with accts[0], which is now controller', async () => {
    const acct0 = accts[0];
    const bpool = await BPool.deployed();
    const controller = await bpool.getController.call();
    assert.equal(acct0, controller);
  });
});
