const assert = require('assert');
const t = require('../util/twrap.js')

const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

const toBN = Web3.utils.toBN
const toWei = Web3.utils.toWei
const fromWei = Web3.utils.fromWei

let args = function () { return [...arguments].map((x)=>toWei(x)) }

describe('fern0 single point per function (fee and no fee)', async()=>{
  let acct0;
  let stub;
  before(async () => {
    accts = await web3.eth.getAccounts();
    acct0 = accts[0];
    stub = await pkg.deploy(web3, acct0, "BStub");
  });

  it('OutGivenIn', async()=>{
    res = await stub.methods.calc_OutGivenIn(...args('5', '10', '2.1', '2.5', '1', '0.05')).call();
  });

});
