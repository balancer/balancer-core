const Web3 = require('web3')
const ganache = require('ganache-core')

const pkg = require('../pkg.js')
pkg.types.loadTestTypes()

const web3 = new Web3(ganache.provider({
  gasLimit: 0xffffffff,
  allowUnlimitedContractSize: true,
  debug: true
}))

let toWei = Web3.utils.toWei;
let fromWei = Web3.utils.fromWei;
let BONE = toWei('1');

describe('calc2', async () => {
    let accts;
    let stub;
    before(async () => {
        accts = await web3.eth.getAccounts();
        stub = await pkg.deploy(web3, accts[0], 'BStub');
    });
    it('runs tests', async () => {
        console.log('hello');
    });
    it('has bpow', async () => {
        let res = await stub.methods.calc_bpow(BONE, BONE).call();
        assert.equal(res, BONE);
    });

});

