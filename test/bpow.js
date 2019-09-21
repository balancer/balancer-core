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
        let res = await fn.call();
        return await fn.call();
    }

    it('always overestimates when base < 1', async function() {
        this.timeout(0);
        let exact = Math.pow(0.5, 0.5);
        for(var i = 0; i < 75; i++) {
            let res = await bpowK('0.5', '0.5', i);
            let resFloat = fromWei(res);
            assert(resFloat >= exact);
        }
    });

    it('overestimates when base > 1, even terms (at least 2)', async function() {
        this.timeout(0);
        let exact = Math.pow(1.5, 0.5);
        for(var i = 2; i < 75; i += 2) {
            let res = await bpowK('1.5', '0.5', i);
            let resFloat = fromWei(res);
            assert(resFloat >= exact, 'result does not overestimate');
        }
    });

    it('underestimates when base > 1, odd terms (at least 1)', async function() {
        this.timeout(0);
        let exact = Math.pow(1.5, 0.5);
        for(var i = 1; i < 75; i += 2) {
            let res = await bpowK('1.5', '0.5', i);
            let resFloat = fromWei(res);
            assert(resFloat <= exact, 'result does not underestimate');
        }
    });

    it('hello', async function() {
        this.timeout(0);
        let eps = 10 ** -6;

        let bases = [
            2/3
          , 1 - eps
          , 1 + eps
          , 1.5
        ]

        let exps = [
            0.02
          , 0.02 + eps
          , 1 - eps
          , 1 + eps
          , 50 - eps
          , 50
        ]
        console.log('bases', bases);
        console.log('exps', exps);
       
        for( base of bases ) {
        for( exp of exps) {
          let last = 1234567
          for(k = 1; k < 60; k += 1) {
            let str = `base exp k ${base} ${exp} ${k}\n`
            let res = await bpowK(base.toString(), exp.toString(), k);
            if( res == last ) { console.log(`CONVERGED AFTER ${k}`); break; }
            else last = res
            str += `result is: ${res}\n`
            //str += `result is: ${fromWei(res)}\n`
            let actual = base**exp;
            assert(actual < 10**58, 'actual < 10**58')
            let rem = actual % 10**-18;
            actual = actual - rem
            let diff;
            let error;
            try {
                actual = toWei(actual.toString());
                str += `actual is: ${actual}\n`
                str += `actual is: ${fromWei(actual)}\n`
                diff = fromWei(res) - fromWei(actual);
                str += `diff: ${diff}\n`;
                error = diff / actual;
                str += `err: ${error}\n`
                if( error > 10**-9 ) {
                    console.log(str);
                }
            } catch (e) {
                console.log('exception with (base exp k)', base, exp, k);
                if(typeof(actual) == 'string')
                    actual = fromWei(actual)
                console.log('base exp actual', base, exp, actual);
                console.log(e);
            }
            console.log('pass base exp k result actual diff error', base, exp, k, res, actual, diff, error);
          }
        }
        } 
    });
});
