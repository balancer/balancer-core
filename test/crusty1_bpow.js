const assert = require('assert');
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

let str = (n) => {
    let big = n * 10**18;
    big = big - (big % 10**18);
    let bn = Web3.utils.toBN(big);
    return bn.toString();
}

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

    it('devpoint', async()=>{
        let res1 = await bpow('1.000001', '0.05');
        let res2 = await bpow('0.6666666666666666', '1.000001');
        let res3 = await bpow('0.6666666666666666', '0.999999');
        console.log(res1);
        console.log(res2);
        console.log(res3);
    });

    for(var i = 0; i < 10; i++) {
      let exact = Math.pow(0.5, 0.5);
      it(`bpowK(0.5, 0.5, ${i}) overestimates`, async function() {
        let res = await bpow('0.5', '0.5', i);
        //let res = await bpowK('0.5', '0.5', i);
        let resFloat = fromWei(res);
        assert(resFloat >= exact, 'result does not overestimate');
      });
    }

    for(var i = 2; i < 10; i++) {
      let exact = Math.pow(1.5, 0.5);
      it(`bpowK(1.5, 0.5, ${i}) overestimates`, async function() {
        let res = await bpow('1.5', '0.5', i);
        //let res = await bpowK('1.5', '0.5', i);
        let resFloat = fromWei(res);
        assert(resFloat >= exact, `result does not overestimate, result: ${resFloat}, exact: ${exact}`);
      });
    }

    it('hello', async function() {
        console.log("long test...");
        this.timeout(0);
        let eps = 10 ** -6;

        let bases = [
            2/3
          , 0.9
          , 1 - eps
          , 1 + eps
          , 1.1
          , 1.5
        ]

        let exps = [
            0.05
          , 0.05 + eps
          , 0.99
          , 1 - eps
          , 1 + eps
          , 1.01
          , 20 - eps
          , 20
        ]

        console.log('bases', bases);
        console.log('exps', exps);
       
        for( base of bases ) {
        for( exp of exps) {
          let last = 1234567
          let converged = false;
          let MAX = 60;
          for(k = 1; k <= 1; k += 1) {
            let desc = `base exp k ${base} ${exp} ${k}\n`
            let res = await bpow(str(base), str(exp));
            //let res = await bpowK(str(base), str(exp), k);
/*
            if( res == last ) {
                console.log(`bpow(${base},${exp}) converged to ${res} after ${k} iterations`);
                converged = true;
                break;
            }
            else last = res
*/
            desc += `result is: ${res}\n`
            desc += `result is: ${fromWei(res)}\n`
            let actual = base**exp;
            assert(actual < 10**58, 'actual < 10**58')
            let diff;
            let error;
            try {
                desc += `actual is: ${toWei(str(actual))}\n`
                desc += `actual is: ${str(actual)}\n`
                diff = Math.abs(fromWei(res) - actual);
                desc += `diff: ${str(diff)}\n`;
                error = diff / actual;
                desc += `err: ${str(error)}\n`
                if( error > 10**-9 ) {
                    //console.log(desc);
                }
            } catch (e) {
                console.log('exception with (base exp k)', base, exp, k);
                console.log('base exp actual', base, exp, actual);
                console.log(e);
                throw e;
            }
            console.log('pass base exp k result actual diff error', base, exp, k, res, actual, diff, error);
          }
//          assert(converged, `bpow(${base},${exp}) didnt converge after ${MAX} iterations (last result: ${last})`);
        }
        } 
    });
});
