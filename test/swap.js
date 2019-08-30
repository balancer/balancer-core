let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let fMath = require("../util/floatMath.js").floatMath;
let pool = require("../util/floatMath.js").pool;
let pkg = require("../pkg.js");
pkg.types.loadTypes("../tmp/combined.json");
let env;

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

let assertLessEqBN = (a, b) => {
    assert(toBN(a).lte(toBN(b)), "error must always favor balancer #27 " + a + " " + b);
}

let isOutput = (fname) => {
    switch( fname ) {
        case "viewSwap_ExactInMinOut":
        case "viewSwap_ExactInLimitPrice":
            return true;
        default:
            return false;
    }
}



let wrappers = {
    setParams: async function(Ti, Bi, Wi, To, Bo, Wo, fee) {
        await env.bpool.methods.setParams(Ti, Wi, Bi)
                       .send({from: env.admin, gas:0xffffffff});
        await env.bpool.methods.setParams(To, Wo, Bo)
                       .send({from: env.admin, gas:0xffffffff});
        await env.bpool.methods.setFee(fee)
                       .send({from: env.admin, gas:0xffffffff});
    },
    viewSwap_AnyInExactOut: async function(Ti, To, Bi, Wi, Bo, Wo, Ao, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, To, Ao];
    },
    viewSwap_MaxInExactOut: async function(Ti, To, Bi, Wi, Li, Bo, Wo, Ao, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, Li, To, Ao];
    },

    viewSwap_ExactInMinOut: async function(Ti, To, Bi, Wi, Ai, Bo, Wo, Lo, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, Ai, To, Lo];
    },
 
    viewSwap_ExactInAnyOut: async function(Ti, To, Bi, Wi, Ai, Bo, Wo, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, To, Ai];
    },

    viewSwap_ExactInLimitPrice: async function(Ti, To, Bi, Wi, Ai, Bo, Wo, Lp, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, Ai, To, Lp];
    },

    viewSwap_LimitPriceInExactOut: async function(Ti, To, Bi, Wi, Bo, Wo, Ao, Lp, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, To, Ao, Lp];
    },

    viewSwap_MaxInMinOutLimitPrice: async function(Ti, To, Bi, Wi, Li, Bo, Wo, Lo, Lp, fee) {
        await this.setParams(Ti, Bi, Wi, To, Bo, Wo, fee);
        return [Ti, Li, To, Lo, Lp];
    },

};

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

describe("generated swap points", function(done) {
    let bmath;
    /*
    beforeEach(async () => {
        env = await scene.phase0(web3);
        bmath = await pkg.deploy(web3, env.admin, "BMath");
    });
    */
    this.timeout(5000);
    before(async () => {
        env = await scene.phase3(web3);
        assert.exists(env.initWeight);
        assert.exists(env.initBalance);
        assert.exists(env.bpool);
    });
 
    for(let funcname in points.pool) {
        let rangeLists = points.pool[funcname]
        for( let rangeList of rangeLists ) {
            let args = rangeList.map(x => x[0]);
            let done = false;
            while( !done ) {

                //let expected = pair[0];
                let desc_swap = `pool.${funcname}(${args})`;
                it(desc_swap, async () => {

                    let actual = pool[funcname](...args);
                    let argsBN = args.map(x => web3.utils.toWei(x.toString()));
                    argsBN     = [env.acoin._address, env.bcoin._address].concat(argsBN);
                    argsBN     = await wrappers[funcname](...argsBN);
 

                    //let view = await env.bpool.methods[funcname](...argsBN)
                    //                          .call();


                    // [res, err]
                    let tryname = funcname.replace("view", "try");
                    let reserr = await env.bpool.methods[tryname](...argsBN)
                                                                  .call();
 
                    let expected = pool[funcname](...args);

                    if( expected.length == 3 ) {
                        let resi = reserr[0];
                        let reso = reserr[1];
                        let err = reserr[2];
                        //console.log("expect=" + expected + " actual=" + [reserr[0], reserr[1]]);
                        assert( expected[2] == web3.utils.hexToNumber(err), "errorcode mismatch" + expected[2] + " " + web3.utils.hexToNumber(err));
                        if( err == berr.ERR_NONE ) {
                            assertCloseBN(resi, toWei(expected[0]), toWei("0.0000001"));
                            assertCloseBN(reso, toWei(expected[1]), toWei("0.0000001"));
                            // #27 approximation error always favors balancer
                            assertLessEqBN(resi, toWei(expected[0]));
                            assertLessEqBN(toWei(expected[1]), reso);
                        }
                    } else if( expected.length == 2 ) {
                        let res = reserr[0];
                        let err = reserr[1];
                        //console.log("expect=" + expected + " actual=" + [reserr[0], reserr[1]]);
                        assert( expected[1] == web3.utils.hexToNumber(err), "errorcode mismatch" + expected[1] + " " + web3.utils.hexToNumber(err));
                        if( err == berr.ERR_NONE ) {
                            assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                            if( isOutput(funcname) ) {
                                assertLessEqBN(toWei(expected[0]), res);
                            } else {
                                assertLessEqBN(res, toWei(expected[0]));
                            }
                        }
                    }
                    if( reserr[expected.length - 1] != berr.ERR_NONE ) {
                        let oldBi = await env.bpool.methods.getBalance(env.acoin._address).call();
                        let oldBo = await env.bpool.methods.getBalance(env.bcoin._address).call();
                        await env.bpool.methods[tryname](...argsBN)
                            .send({from: env.admin, gas: 0xffffffff}, (err) => {
                                assert(err == null, "send failed");
                            });
                        let newBi = await env.bpool.methods.getBalance(env.acoin._address).call();
                        let newBo = await env.bpool.methods.getBalance(env.bcoin._address).call();
                        assert(newBi == oldBi, "Ti state change caused by trySwap errorcode #26 " + newBi + " " + oldBi);
                        assert(newBo == oldBo, "To state change caused by trySwap errorcode #26");
                    }
 
 
                });
                done = incArgList(args, rangeList);
            }
        }
    }
});

/*
                    let reserr;
                    let oldBi = await env.bpool.methods.getBalance(env.acoin._address).call();
                    let oldBo = await env.bpool.methods.getBalance(env.bcoin._address).call();
                    let doname = funcname.replace("view", "do");
                    await env.bpool.methods[doname](...argsBN)
                        .send({from: env.admin, gas: 0xffffffff}, (e) => {
                            if( e != null ) {
                                reserr = berr[e.results[e.hashes[0]].reason];
                                console.log(reserr);
                            }
                        });
                    let resi = await env.bpool.methods.getBalance(env.acoin._address).call() - oldBi;
                    let reso = await env.bpool.methods.getBalance(env.bcoin._address).call() - oldBo;
                    assert(resi >= 0, "input token balance should not decrease");
                    assert(reso <= 0, "output token balance should not increase");
 
                    let expected = pool[funcname](...args);
                    if( expected.length == 3 ) {
                        //let resi = reserr[0];
                        //let reso = reserr[1];
                        //let err = reserr[2];
                        //console.log("expect=" + expected + " actual=" + [reserr[0], reserr[1]]);
                        assert( expected[2] == web3.utils.hexToNumber(err), "errorcode mismatch" + expected[2] + " " + web3.utils.hexToNumber(err));
                        if( err == berr.ERR_NONE ) {
                            assertCloseBN(resi, toWei(expected[0]), toWei("0.0000001"));
                            assertCloseBN(reso, toWei(expected[1]), toWei("0.0000001"));
                            // #27 approximation error always favors balancer
                            assertLessEqBN(resi, toWei(expected[0]));
                            assertLessEqBN(toWei(expected[1]), reso);
                        }
                    } else if( expected.length == 2 ) {
                        let res = isOutput(funcname) ? reso : resi;
                        let err = reserr;
                        //console.log("expect=" + expected + " actual=" + [reserr[0], reserr[1]]);
                        assert( expected[1] == web3.utils.hexToNumber(err), "errorcode mismatch" + expected[1] + " " + web3.utils.hexToNumber(err));
                        if( err == berr.ERR_NONE ) {
                            assertCloseBN(res, toWei(expected[0]), toWei("0.0000001"));
                            if( isOutput(funcname) ) {
                                assertLessEqBN(toWei(expected[0]), res);
                            } else {
                                assertLessEqBN(res, toWei(expected[0]));
                            }
                        } else {
                            assert(resi == 0, "state change in error case");
                        }
                    }

*/
