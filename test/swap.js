let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let fmath = require("../util/floatMath.js").floatMath;
let pkg = require("../pkg.js");
pkg.types.loadTypes("../tmp/combined.json");

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
        if (typeof(pt[0]) == 'string') {
            console.log('WARN: skipping error case');
            continue;
        }
        it(`test pt ${pt}`, async () => {
            let expected = pt[0];
            let args = pt[1];
            let Bi = args[0]; let Wi = args[1];
            let Bo = args[2]; let Wo = args[3];
            let Ai = args[4];
            let fee = args[5];
            await env.bpool.methods.setParams(env.acoin._address, toWei(Bi), toWei(Wi))
                           .send({from: env.admin, gas:0xffffffff});
            await env.bpool.methods.setParams(env.bcoin._address, toWei(Bo), toWei(Wo))
                           .send({from: env.admin, gas:0xffffffff});
            await env.bpool.methods.setFee(toWei(fee))
                           .send({from: env.admin, gas:0xffffffff});

            let view = await env.bpool.methods.viewSwap_ExactInMinOut(env.acoin._address, toWei(Ai), env.bcoin._address, '0')
                                      .call();

            // [res, err]
            let reserr = await env.bpool.methods.trySwap_ExactInMinOut(env.acoin._address, toWei(Ai), env.bcoin._address, '0')
                                                .call();
            let res = reserr[0];
            let err = reserr[1];
            assertCloseBN(res, toWei(expected), toWei("0.0000001"));

        });
    }
});
