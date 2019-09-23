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

    let args = function () { return [...arguments].map((x)=>toWei(x)) }

    before(async () => {
        let acct0 = (await web3.eth.getAccounts())[0];
        stub = await pkg.deploy(web3, acct0, 'BStub')

        smallWeight = await stub.methods.MIN_WEIGHT().call();
        midWeight = toWei('50.0')
        bigWeight = await stub.methods.MAX_WEIGHT().call();

        smallBalance = await stub.methods.MIN_BALANCE().call();
        midBalance = toWei('1.0');
        bigBalance = await stub.methods.MAX_BALANCE().call();
    });

    it('meta', async()=>{
        assert(smallWeight > 0);
    });

    it('devpoint', async()=>{
        let res = await stub.methods.calc_PoolOutGivenSingleIn(...args('100', '10', '500', '50', '10', '0')).call();
        console.log(res);
    });

    it('a long test of many extremes', async function() {
        this.timeout(0);
        for(weightI of [smallWeight, midWeight, bigWeight]) {
        for(weightO of [smallWeight, midWeight, bigWeight]) {
          for(balanceI of [smallBalance, midBalance, bigBalance]) {
          for(balanceO of [smallBalance, midBalance, bigBalance]) {
            smallAmount = toWei('0.000000001'); // TODO as fractions of balanceI / balanceO
            midAmount = toWei('1')
            bigAmount = toWei('100')
            // calc_SpotPrice
            for(amount of [smallAmount, midAmount, bigAmount]) {
                console.log(`calc_OutGivenIn(${balanceI}, ${weightI}, ${balanceO}, ${weightO}, 0, 0)`)
                let res = await stub.methods.calc_OutGivenIn(balanceI, weightI, balanceO, weightO, amount, 0).call();
                console.log(res);
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
});
