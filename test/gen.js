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
let mathTests = {
    "calc_OutGivenIn": [
        [ (1 - Math.pow((2/(2+1)),(0.1/0.1))) * 2
        , [2, 0.1, 2, 0.1, 1, 0] ]
    ]
}

let toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()));

let tolerance = 10 ** -6;
let toleranceBN = toBNum(tolerance);
assert.closeBN = (actual, expected) => {
    let actualBN = actual;
    let expectedBN = expected;
    if( typeof(actual) == 'string' ) { 
        actualBN = web3.utils.toBN(actual);
    }
    if( typeof(expected) == 'string' ) {
        expectedBN = web3.utils.toBN(expected);
    }
    let diff = actualBN.sub(expectedBN).abs();
    assert(diff.lt(toleranceBN),
        `assert.closeBN( ${actual}, ${expected}, ${toleranceBN} )`
    );
}

describe("generated math tests", () => {
    let env;
    let bmath;
    beforeEach(async () => {
        env = await scene.phase0(web3);
        bmath = await pkg.deploy(web3, env.admin, "BMath");
    });
    for(let funcname in mathTests) {
        pairs = mathTests[funcname]
        for( let pair of pairs ) {
            let expected = pair[0];
            let args = pair[1]
            desc_fmath = `${expected} ?= fmath.${funcname}(${args})`;
            let actual;
            it(desc_fmath, async () => {
                actual = fmath[funcname](...args);
                assert.closeTo(expected, actual, tolerance);
            });
            let expectedBN = web3.utils.toWei(expected.toString());
            let argsBN = [];
            for( arg of args ) {
                argsBN.push(web3.utils.toWei(arg.toString()))
            }
            desc_bmath = `${expectedBN} ?= BMath.${funcname}(${argsBN})`;
            let actualBN;
            it(desc_bmath, async () => {
                actualBN = await bmath.methods[funcname](...argsBN).call();
                assert.closeBN(actualBN, expectedBN);
            });
            it(`fmath.${funcname}(${args}) ~= bmath.${funcname}(...)`, () => {
                assert.closeBN(actualBN, toBNum(actual));
            });
        }
    }
});
