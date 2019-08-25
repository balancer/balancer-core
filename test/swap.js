let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let fmath = require("../util/floatMath.js").floatMath;
let pkg = require("../package.js");
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

describe("swaps", () => {
    // `env.bpool` has `env.admin` as its manager.
    // `env.{a,b,c}coin` are 3 tokens that are bound to the bpool
    // OutGivenIn points are good for testing these swap functions:
    //   getSpotPrice
    //   *swap_ExactInAnyOut
    //   *swap_ExactInMinOut
    //   *swap_ExactInLimitPrice
    //   *swap_MaxInMinOutLimitPrice
    for( let pt of points.math.calc_OutGivenIn ) {
        describe(`with weights / balances / amt: ${pt}`, () => {

            let env;
            let setup = async () => {
                env = await scene.phase3(web3);
                await env.bpool.methods.setParams(env.acoin._address, toWei(Wi), toWei(Bi))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setParams(env.bcoin._address, toWei(Wo), toWei(Bo))
                               .send({from: env.admin, gas:0xffffffff});
                await env.bpool.methods.setFee(toWei(fee))
                               .send({from: env.admin, gas:0xffffffff});
            }

            before(setup);
            afterEach(setup);

            let expected = pt[0];
            let args = pt[1];
            let Bi = args[0]; let Wi = args[1];
            let Bo = args[2]; let Wo = args[3];
            let Ai = args[4];
            let fee = args[5];

            it(`spot price`, () => {});

            it(`before/after balances:  doSwap_ExactInAnyOut(${args})`, async () => {

                let Abefore = await env.bpool.methods.getBalance(env.acoin._address).call();
                let Bbefore = await env.bpool.methods.getBalance(env.bcoin._address).call();
                await env.pool.doSwap_ExactInAnyOut(env.acoin._address, toWei(Ai), env.bcoin._address);
                let Aafter = await env.bpool.methods.getBalance(env.acoin._address).call();
                let Bafter = await env.bpool.methods.getBalance(env.bcoin._address).call();
                // TODO assert bignum(Abefore).sub(bignum(Aafter)) == Ai  etc
            });

            it(`${expected} ?= *swap_ExactInAnyOut(${args})`, async () => {
                let view = await env.bpool.methods.viewSwap_ExactInAnyOut(env.acoin._address, toWei(Ai), env.bcoin._address)
                                          .call();

                // [res, err]
                let reserr = await env.bpool.methods.trySwap_ExactInAnyOut(env.acoin._address, toWei(Ai), env.bcoin._address)
                                                    .call();
                let res = reserr[0];
                let err = reserr[1];

                assert.equal(view, res);
                assertCloseBN(res, toWei(expected), toWei("0.0000001"));

            });

        }); // describe pt
    } // for

    // InGivenOut points are good for testing these swap functions:
    for( let pt of points.math.calc_InGivenOut) {
    }
});
