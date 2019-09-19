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

    let bpow = async (b, e) => {
        return await stub.methods.calc_bpow(b, e).call();
    }

    before(async () => {
        accts = await web3.eth.getAccounts();
        stub = await pkg.deploy(web3, accts[0], 'BStub');
    });

    it('has bpow', async () => {
        let res = await bpow(BONE, BONE);
        assert.equal(res, BONE);
    });

    it('bpow min and max base', async () => {
        bpow(0, 0).catch((e) => {
            assert(-1 != e.message.indexOf("ERR_BPOW_BASE"));
        });
    });

});

