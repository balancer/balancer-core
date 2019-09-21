const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))


const toWei = web3.utils.toWei
const fromWei = web3.utils.fromWei

const slightly = require('../util/slightly.js');

describe('calc', async () => {
    let stub;
    before(async () => {
        let acct0 = (await web3.eth.getAccounts())[0];
        stub = await pkg.deploy(web3, acct0, 'BStub')
    });

    let smallWeight = 1.0000001
    let midWeight = 50
    let bigWeight = 99.999999

    let smallBalance;
    let midBalance;
    let bigBalance;

    let smallAmount;
    let midAmount;
    let bigAmount;

    for(weightA of [smallWeight, midWeight, bigWeight]) {
    for(weightB of [smallWeight, midWeight, bigWeight]) {
      for(balanceA of [smallBalance, midBalance, bigBalance]) {
      for(balanceB of [smallBalance, midBalance, bigBalance]) {
        for(amount of [smallAmount, midAmount, bigAmount]) {
            // calc_ExactAmountIn
            // calc_ExactAmountOut

            // calc_ExactMarginPrice ?
            // calc_ThreeLimitMaximize ?
        }
      }
      }
    }
    }
});
