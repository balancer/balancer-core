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

  describe('BMath', () => {
    let tmath;
    before(async () => {
      expect(admin).not.to.equal(nonAdmin);
      tmath = await TMath.deployed();
    });

    it('badd throws on overflow', async () => {
      await assertThrow(tmath.calc_badd(1, MAX), 'ERR_ADD_OVERFLOW');
    });

    it('bsub throws on underflow', async () => {
      await assertThrow(tmath.calc_bsub(1, 2), 'ERR_SUB_UNDERFLOW');
    });

    it('bmul throws on overflow', async () => {
      await assertThrow(tmath.calc_bmul(2, MAX), 'ERR_MUL_OVERFLOW');
    });

    it('bdiv throws on div by 0', async () => {
      await assertThrow(tmath.calc_bdiv(1, 0), 'ERR_DIV_ZERO');
    });

    it('bpow throws on base outside range', async () => {
      await assertThrow(tmath.calc_bpow(0, 2), 'ERR_BPOW_BASE_TOO_LOW');
      await assertThrow(tmath.calc_bpow(MAX, 2), 'ERR_BPOW_BASE_TOO_HIGH');
    });

  });

});