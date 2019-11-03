const { assertThrow } = require('../lib/tests/assertThrow');
const TMath = artifacts.require('TMath');

contract('TMath', async (accounts) => {
  const admin = accounts[0];
  const nonAdmin = accounts[1];
  const toHex = web3.utils.toHex;
  const toBN = web3.utils.toBN;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;

  const MAX = web3.utils.toTwosComplement(-1);

  describe('Admin controller', () => {
    let tmath;
    before(async () => {
      expect(admin).not.to.equal(nonAdmin);
      tmath = await TMath.deployed();
    });

    it('badd throws on overflow', async () => {
      await assertThrow(tmath.NumBadd(1, MAX), 'ERR_ADD_OVERFLOW');
    });

    it('bsub throws on underflow', async () => {
      await assertThrow(tmath.NumBsub(1, MAX), 'ERR_SUB_UNDERFLOW');
    });

  });

});