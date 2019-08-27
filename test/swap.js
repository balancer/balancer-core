let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let fMath = require("../util/floatMath.js").floatMath;
let pkg = require("../package.js");
pkg.types.loadTypes("../tmp/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let scene = require("./scene.js");
let points = require("./points.js");
let berr = require("../util/error.js");

let toBN = web3.utils.toBN;
let toWei = (n) => web3.utils.toWei(n.toString());
let toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()));

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}


// return true if at end of all ranges
function incArgList(args, ranges) {
    for( let i = 0; i < args.length; i++ ) {
        args[i] += ranges[i][2];
        if( args[i] > ranges[i][1] ) {
            for( let j = 0; j <= i; j++ ) {
                args[j] = ranges[j][0];
            }
        } else {
            return false;
        }
    }
    return true;
}
// Single-swap basic tests
describe("swaps", function(done) {
    let env;
    this.timeout(5000);
    before(async () => {
        env = await scene.phase3(web3);
        assert.exists(env.initWeight);
        assert.exists(env.initBalance);
        assert.exists(env.bpool);
    });
    for( let pt of points.ExactInAnyOutPoints ) {

        let args = pt.map(x => x[0]);

        let done = false;
        while( !done ) {


            it(`ExactInAnyOut test pt ${args}`, async () => {
                let Bi = args[0]; let Wi = args[1];
                let Bo = args[3]; let Wo = args[4];
                let Ai = args[2];
                let fee = args[5];
 
                //let expected = pt[0];
                //let args = pt[1];
                await env.bpool.methods.setParams(env.acoin._address, toWei(Wi), toWei(Bi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Wo), toWei(Bo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});
                let expected = fMath.pool_viewSwap_ExactInAnyOut(Bi, Wi, Ai, Bo, Wo, fee);
                let view = await env.bpool.methods.viewSwap_ExactInAnyOut(env.acoin._address, env.bcoin._address, toWei(Ai))
                                          .call();

                // [res, err]
                let reserr = await env.bpool.methods.trySwap_ExactInAnyOut(env.acoin._address, env.bcoin._address, toWei(Ai))
                                                    .call();
                let res = reserr[0];
                let err = reserr[1];
                assert( expected[1] == web3.utils.hexToNumber(err), "errorcode mismatch" + expected[1] + " " + web3.utils.hexToNumber(err));
                if( err == berr.ERR_NONE ) {
                    assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                }
            });

            done = incArgList(args, pt);
        }
    }

    for( let pt of points.AnyInExactOutPoints ) {

        let args = pt.map(x => x[0]);

        let done = false;
        while( !done ) {


            it(`AnyInExactOut test pt ${args}`, async () => {
                let Bi = args[0]; let Wi = args[1];
                let Bo = args[2]; let Wo = args[3];
                let Ao = args[4];
                let fee = args[5];
 
                //let expected = pt[0];
                //let args = pt[1];
                await env.bpool.methods.setParams(env.acoin._address, toWei(Wi), toWei(Bi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Wo), toWei(Bo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});
                let expected = fMath.pool_viewSwap_AnyInExactOut(Bi, Wi, Bo, Wo, Ao, fee);
                let view = await env.bpool.methods.viewSwap_AnyInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao))
                                          .call();

                // [res, err]
                let reserr = await env.bpool.methods.trySwap_AnyInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao))
                                                    .call();
                let res = reserr[0];
                let err = reserr[1];
                assert( expected[1] == err, "errorcode mismatch" + expected[1] + " " + err);
                if( err == berr.ERR_NONE ) {
                    assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                }
            });

            done = incArgList(args, pt);
        }
    }

    /*
    for( let pt of points.OutGivenInPoints ) {

        let args = pt.map(x => x[0]);

        let done = false;
        while( !done ) {


            it(`AnyInExactOut test pt ${args}`, async () => {
                let Bi = args[0]; let Wi = args[1];
                let Bo = args[2]; let Wo = args[3];
                let Ao = args[4];
                let fee = args[5];
 
                //let expected = pt[0];
                //let args = pt[1];
                await env.bpool.methods.setParams(env.acoin._address, toWei(Wi), toWei(Bi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Wo), toWei(Bo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});
                let expected = fMath.pool_viewSwap_AnyInExactOut(Bi, Wi, Bo, Wo, Ao, fee);
                let view = await env.bpool.methods.viewSwap_AnyInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao))
                                          .call();

                // [res, err]
                let reserr = await env.bpool.methods.trySwap_AnyInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao))
                                                    .call();
                let res = reserr[0];
                let err = reserr[1];
                assert( expected[1] == err, "errorcode mismatch" + expected[1] + " " + err);
                if( err == berr.ERR_NONE ) {
                    assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                }
            });

            done = incArgList(args, pt);
        }
    }
    */


    for( let pt of points.LimitPriceInExactOutPoints) {

        let args = pt.map(x => x[0]);

        let done = false;
        while( !done ) {

            it(`InGivenPrice test pt ${args}`, async () => {
                let Bi = args[0]; let Wi = args[1];
                let Bo = args[2]; let Wo = args[3];
                let Ao = args[4];
                let SER1 = args[5];
                let fee = args[6];
 
                //let expected = pt[0];
                //let args = pt[1];
                await env.bpool.methods.setParams(env.acoin._address, toWei(Wi), toWei(Bi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Wo), toWei(Bo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});
                let expected = fMath.pool_viewSwap_LimitPriceInExactOut(Bi, Wi, Bo, Wo, Ao, SER1, fee);
                let view = await env.bpool.methods.viewSwap_LimitPriceInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao), toWei(SER1))
                                          .call();

                // [res, err]
                let reserr = await env.bpool.methods.trySwap_LimitPriceInExactOut(env.acoin._address, env.bcoin._address, toWei(Ao), toWei(SER1))
                                                    .call();

                let resi = reserr[0];
                let reso = reserr[1];
                let err = reserr[2];
                assert( expected[2] == err, "errorcode mismatch" + expected[2] + " " + err);
                if( err == berr.ERR_NONE ) {
                    assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                }
            });

            done = incArgList(args, pt);
        }
    }

});
