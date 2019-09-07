let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let fmath = require("../util/floatMath.js").floatMath;
let pkg = require("../pkg.js");
pkg.types.loadTestTypes();

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let scene = require("./scene.js");
let points = require("./points.js");

let toBN = web3.utils.toBN;
let toWei = (n) => web3.utils.toWei(n.toString());
let toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()));

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}

// Single-swap basic tests
describe("swaps", () => {
    let env;
    beforeEach(async () => {
        env = await scene.phase3(web3);
        assert.exists(env.initWeight);
        assert.exists(env.initBalance);
        assert.exists(env.bpool);
    });
    for( let pt of points.math.calc_OutGivenIn ) {
        it(`test pt ${pt}`, async () => {
            let expected = pt[0];
            let args = pt[1];
            let Bi = args[0]; let Wi = args[1];
            let Bo = args[2]; let Wo = args[3];
            let Ai = args[4];
            let fee = args[5];
            try {
                await env.bpool.methods.setParams(env.acoin._address, toWei(Bi), toWei(Wi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Bo), toWei(Wo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});

                let res = await env.bpool.methods
                                         .swap_ExactAmountIn( env.acoin._address, toWei(Ai)   // Ti, Ai
                                                            , env.bcoin._address, '0'         // To, Ao
                                                            , '0');                           // LP

                if (typeof(expected) == 'number') {
                    assertCloseBN(res, toWei(expected), toWei("0.0000001"));
                }
                if (typeof(expected) == 'string') {
                    assert.equal(res, expected);
                }

                throw null;
            } catch (err) {
                if (err != null && typeof(expected) == 'string') {
                    assert.equal(err.name, 'RuntimeError');
                    // extract error string
                    assert(Object.keys(err.results).length == 1, 'more than one exception in transaction!?');
                    let trxID = Object.keys(err.results)[0];
                    let info = err.results[trxID];
                    let errStr = info.reason;
                    assert.equal(errStr, expected);
                    return;
                }
            }

        });
    }
});
