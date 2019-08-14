assert = require("chai").assert;
let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../pkg.js");
let math = require("../src/floatMath.js")
let fMath = math.floatMath;

let testPoints = require("./points.js");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let approxTolerance = 10 ** -6;
let floatEqTolerance = 10 ** -12;

let bn = (num) => { return web3.utils.toBN(num); }
let bNum = (num) => {
    return bn(Math.floor(num * 10**9)).mul(bn(10**9));
}
let assertCloseBN = (a, b, tolerance) => {
    tolerance = bNum(tolerance);
    assert(a.sub(b).abs().lt(tolerance), `assertCloseBN( ${a} , ${b} )`);
}

describe("floatMath.js", function () {
    for( pt_ of testPoints.spotPricePoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= spotPrice(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`;
        it(desc, function () {
            assert.closeTo(pt.res, fMath.spotPrice(pt.Bi, pt.Wi, pt.Bo, pt.Wo), floatEqTolerance);
        });
    }
    for( pt_ of testPoints.swapImathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} == swapIMathExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.swapImathExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ai, pt.fee)
                          , floatEqTolerance);
        });
    }
    for( pt_ of testPoints.swapImathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= swapIMathApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.swapImathApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ai, pt.fee)
                          , approxTolerance);
        });
    }
    for( pt_ of testPoints.spotPriceImathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= spotPriceImathExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.spotPriceImathExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
                          , approxTolerance);
        });
    }
    for( pt_ of testPoints.spotPriceImathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= spotPriceImathApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.spotPriceImathApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
                          , approxTolerance);
        });
    }
 
 
    for( pt_ of testPoints.powPoints) {
        let pt = pt_;
        var desc = `${pt.res} ~= powApprox(${pt.base}, ${pt.exp})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.powApprox(pt.base, pt.exp)
                          , approxTolerance);
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

describe("BalancerMath", () => {
    for( pt_ of testPoints.powPoints ) {
        let pt = pt_;
        let desc = `${pt.res} ~= math.wpowapprox(${pt.base}, ${pt.exp})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            let base = bNum(pt.base).toString();
            let exp  = bNum(pt.exp).toString();
            var actual = await math.methods.wpowapprox(base, exp).call()
            assertCloseBN(bNum(pt.res), web3.utils.toBN(actual), approxTolerance);
        });
    }
 
    for( pt_ of testPoints.spotPricePoints ) {
        let pt = pt_;
        let res = bNum(pt.res);
        let Bi = bNum(pt.Bi).toString();
        let Wi = bNum(pt.Wi).toString();
        let Bo = bNum(pt.Bo).toString();
        let Wo = bNum(pt.Wo).toString();
        let desc = `${res} ~= bMath.spotPrice(${Bi}, ${Wi}, ${Bo}, ${Wo})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.spotPrice(Bi, Wi, Bo, Wo).call()
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
    for( pt_ of testPoints.spotPricePoints ) {
        let pt = pt_;
        let res = bNum(pt.res);
        let Bi = bNum(pt.Bi).toString();
        let Wi = bNum(pt.Wi).toString();
        let Bo = bNum(pt.Bo).toString();
        let Wo = bNum(pt.Wo).toString();
        let desc = `${res} ~= bMath.spotPrice(${Bi}, ${Wi}, ${Bo}, ${Wo})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.spotPrice(Bi, Wi, Bo, Wo).call()
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }

    for( pt_ of testPoints.spotPriceImathPoints ) {
        let pt = pt_;
        let res  = bNum(pt.res);
        //let SER0 = bNum(pt.SER0).toString();
        let SER1 = bNum(pt.SER1).toString();
        let Bi   = bNum(pt.Bi).toString();
        let Wi   = bNum(pt.Wi).toString();
        let Bo   = bNum(pt.Bo).toString();
        let Wo   = bNum(pt.Wo).toString();
        let fee  = bNum(pt.fee).toString();
        let desc = `${res} ~= bMath.spotPriceImathApprox(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${SER1}, ${fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.spotpriceimathapprox(Bi, Wi, Bo, Wo, SER1, fee).call()
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
 
 
    for( pt of testPoints.swapImathPoints ) {
        let res = bNum(pt.res);
        let Bi = bNum(pt.Bi).toString();
        let Wi = bNum(pt.Wi).toString();
        let Bo = bNum(pt.Bo).toString();
        let Wo = bNum(pt.Wo).toString();
        let Ai = bNum(pt.Ai).toString();
        let fee = bNum(pt.fee).toString();
        var desc = `${res} ~= bMath.swapImath(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.swapImath(Bi, Wi, Bo, Wo, Ai, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }


});
