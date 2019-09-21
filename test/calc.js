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

describe('Calc', async () => {
    let stub;

    let smallWeight;
    let midWeight;
    let bigWeight;

    let smallBalance;
    let midBalance;
    let bigBalance;

    let smallAmount;
    let midAmount;
    let bigAmount;

    before(async () => {
        let acct0 = (await web3.eth.getAccounts())[0];
        stub = await pkg.deploy(web3, acct0, 'BStub')
        smallWeight = await stub.methods.MIN_WEIGHT().call();
        midWeight = toWei('50.0')
        bigWeight = await stub.methods.MAX_WEIGHT().call();
        console.log('small:', smallWeight);
    });

    it('meta', async()=>{
        assert(smallWeight > 0);
    });
    for(weightA of [smallWeight, midWeight, bigWeight]) {
    for(weightB of [smallWeight, midWeight, bigWeight]) {
      for(balanceA of [smallBalance, midBalance, bigBalance]) {
      for(balanceB of [smallBalance, midBalance, bigBalance]) {
        // calc_SpotPrice
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
