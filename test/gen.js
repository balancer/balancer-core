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
//let tests = require("./points.js");

let state = require("./state.js");
let math = require("./math/points.js");

let toBNum = (n) => web3.utils.toBN(web3.utils.toWei(n.toString()));

let tolerance = 10 ** -6;
let toleranceBN = toBNum(tolerance);

function appendArg(bases, args) {
    let res = [];

    for( b of bases ) {
        for( a of args ) {
            res += [b + [a]];
        }
    }
    return res;
}




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
    let states = state.states;

    function combinations(args) {
        function combine(base, name, argList) {
            let res = []
            for( let b of base ) {
                for( let arg of argList ) {

                    let newArg = {};
                    newArg[name] = name == "token" ? [arg] : arg;

                    if( b[name] == undefined ) {
                        res = res.concat([{...b, ...newArg}]);
                    } else {
                        newArg[name] = b[name].concat(newArg[name]);
                        res = res.concat(newArg);
                    }

                }
            }
            return res;
        }
        let res = [{}];
        for( name in args ) {
            if( name == "token" ) {
                for( let pairs of args[name] ) {
                    res = combine(res, name ,pairs);
                }
            } else {
                res = combine(res, name, args[name]);
            }
        }
        return res;
    }
    for( let testName in state.states ) {
        let s = state.states[testName];
        let states = combinations(s)
    }
    assert.fail();
    for(let funcname in math.tests) {
        pairs = math.tests[funcname]
        let argLists = genArgLists([], states);
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
            it(`  -> fmath.${funcname}(${args}) ~= bmath.${funcname}(...)`, () => {
                assert.closeBN(actualBN, toBNum(actual));
            });
        }
    }
});
