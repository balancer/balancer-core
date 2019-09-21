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

describe('bpow', async () => {
    let stub;
    before(async () => {
        let acct0 = (await web3.eth.getAccounts())[0];
        stub = await pkg.deploy(web3, acct0, 'BStub')
    });

    let bpow = async (a, b) => {
        let fn = stub.methods.calc_bpow(toWei(a), toWei(b));
        return await fn.call();
    }

    let bpowK = async(a, b, K) => {
        let fn = stub.methods.calc_bpowK(toWei(a), toWei(b), K);
        let gas = await fn.estimateGas();
        let res = await fn.call();
        console.log(K, gas, res);
        return await fn.call();
    }

    it('exists', async () => {
        let res = await bpow('1', '1');
    });

    it('overestimates', async function() {
        this.timeout(30000);
        let exact = Math.pow(0.5, 0.5);
        for(var i = 0; i < 100; i++) {
            let res = await bpowK('0.5', '0.5', i);
            let resFloat = fromWei(res);
            assert(resFloat >= exact);
        }
    });

});
