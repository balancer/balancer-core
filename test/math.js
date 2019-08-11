assert = require("chai").assert;
var math = require("../src/floatMath.js")
var fMath = math.floatMath;

let approxTolerance = 10 ** -6;
let floatEqTolerance = 10 ** -12;

let Web3 = require("web3");
let ganache = require("ganache-core");

let deployer = require("../src/deployer.js")
let buildout = require("../out/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true
}));

let bn = (num) => { return web3.utils.toBN(num); }
let bNum = (num) => {
    return bn(Math.floor(num * 10**9)).mul(bn(10**9));
}
let assertCloseBN = (a, b, tolerance) => {
    tolerance = bNum(tolerance);
    assert(a.sub(b).lt(tolerance), `assertCloseBN( ${a} , ${b} )`);
}

var env = {};

// Result, Bi, Wi, Bo, Wo
var spotPricePoints = [
    [4, 1, 0.2, 10, 0.5],
    [1/4, 10, 0.5, 1, 0.2],

    [0.00025, 6000, 0.3, 1, 0.2],
    [1/0.00025, 1, 0.2, 6000, 0.3],

    [1000, 10, 0.5, 6000, 0.3],
    [1/1000, 6000, 0.3, 10, 0.5]
];

// result, Bi, Wi, Bo, Wo, Ai, fee
var swapImathPoints = [
    [2/3, 2, 1, 2, 1, 1, 0],
    [20/3, 20, 10, 20, 10, 10, 0],
    [10/9, 2, 1, 2, 0.5, 1, 0],
    [2*(1-Math.pow(2/3, 1/2)), 2, 0.5, 2, 1, 1, 0],
]

describe("floatMath.js", function () {
    for( pt of swapImathPoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        let Ai = pt[5]; let fee = pt[6];
        var desc = `${res} == swapIMathExact(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, function () {
            assert.closeTo(res, fMath.swapImathExact(Bi, Wi, Bo, Wo, Ai, fee), floatEqTolerance);
        });
    }
    for( pt of swapImathPoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        let Ai = pt[5]; let fee = pt[6];
        var desc = `${res} ~= swapIMathApprox(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, function () {
            assert.closeTo(res, fMath.swapImathApprox(Bi, Wi, Bo, Wo, Ai, fee), approxTolerance);
        });
    }
    /*
    for( pt of swapImathPoints ) {
        let Ao = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        let Ai = pt[5]; let fee = pt[6];
        var desc = `${Ai} ~= swapOmath(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ao}, ${fee})`;
        it(desc, function () {
            assert.closeTo(fMath.swapOmathExact(Bi, Wi, Bo, Wo, Ao, fee), 
                           fMath.swapOmathApprox(Bi, Wi, Bo, Wo, Ao, fee), 
                           approxTolerance);
        });
    }
    */
 
    for( pt of spotPricePoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        var desc = `${res} ~= spotPrice(${Bi}, ${Wi}, ${Bo}, ${Wo})`;
        it(desc, function () {
            assert.closeTo(res, fMath.spotPrice(Bi, Wi, Bo, Wo), floatEqTolerance);
        });
    }

    it("should throw if Ai >= Bi", () => {
        assert.throws(() => { fMath.swapIMathExact(1, 2, 2, 2, 1, 0); });
    });
    it("should throw if fee >= 1", () => {
        assert.throws(() => { fMath.swapIMathExact(2, 2, 2, 2, 2, 1); });
    });
    it("should throw if any arg except fee is 0", () => {
        assert.throws(() => { fMath.swapIMathExact(0, 1, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 0, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 0, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 0, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 1, 0, 0); });
        assert.throws(() => { fMath.swapIMathApprox(0, 1, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 0, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 0, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 0, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 1, 0, 0); });
    });

});

describe("BalanceMath", () => {
    for( pt of spotPricePoints ) {
        let res = bNum(pt[0]);
        let Bi = bNum(pt[1]).toString();
        let Wi = bNum(pt[2]).toString();
        let Bo = bNum(pt[3]).toString();
        let Wo = bNum(pt[4]).toString();
        let desc = `${res} ~= bMath.spotPrice(${Bi}, ${Wi}, ${Bo}, ${Wo})`;
        it(desc, async () => {
            env = await deployer.deployTestEnv(web3, buildout);
            var actual = await env.math.methods.spotPrice(Bi, Wi, Bo, Wo).call()
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
    for( pt of swapImathPoints ) {
        let res = bNum(pt[0]);
        let Bi = bNum(pt[1]).toString();
        let Wi = bNum(pt[2]).toString();
        let Bo = bNum(pt[3]).toString();
        let Wo = bNum(pt[4]).toString();
        let Ai = bNum(pt[5]).toString();
        let fee = bNum(pt[6]).toString();
        var desc = `${res} ~= bMath.swapImathApprox(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, async () => {
            env = await deployer.deployTestEnv(web3, buildout);
            var actual = await env.math.methods.swapImath(Bi, Wi, Bo, Wo, Ai, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
});
