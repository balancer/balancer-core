assert = require("chai").assert;
let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../package.js");
let math = require("../util/floatMath.js")
let fMath = math.floatMath;

let testPoints = require("./points.js");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let approxTolerance = 10 ** -6;
let floatEqTolerance = 10 ** -12;

let toBN = web3.utils.toBN;
let toWei = (n) => web3.utils.toWei(n.toString());

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
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
 
    for( pt_ of testPoints.swapOmathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} == swapOMathExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.swapOmathExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
                          , floatEqTolerance);
        });
    }

    for( pt_ of testPoints.swapOmathPoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= swapOMathApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.swapOmathApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
                          , approxTolerance);
        });
    }

    for( pt_ of testPoints.amountUpToPricePoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= amountUpToPriceExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.amountUpToPriceExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
                          , approxTolerance);
        });
    }
    for( pt_ of testPoints.amountUpToPricePoints ) {
        let pt = pt_;
        var desc = `${pt.res} ~= amountUpToPriceApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.amountUpToPriceApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
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

    it("powApprox approximate float precision range", () => {
        for( base = 1.95; base > 0.05; base *= 0.95 ) {
            for( exponent = 10; exponent > 0.1; exponent *= 0.95) {
                assert.closeTo(base ** exponent
                              , fMath.powApprox(base, exponent)
                              , 0.001
                              , `base: ${base}, exponent: ${exponent}`);
            }
        }
    });

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
    for( let pt of testPoints.powPoints ) {
        
        let desc = `${pt.res} ~= math.wpow(${pt.base}, ${pt.exp})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            let base = toWei(pt.base).toString();
            let exp  = toWei(pt.exp).toString();
            var actual = await math.methods.wpow(base, exp).call()
            assertCloseBN(toWei(pt.res), web3.utils.toBN(actual), approxTolerance);
        });
    }
    for( let pt of testPoints.spotPricePoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let desc = `${pt.res} ~= bMath.spotPrice(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.spotPrice(Bi, Wi, Bo, Wo).call()
            assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance);
        });
    }

    for( let pt of testPoints.amountUpToPricePoints ) {
        let res  = toWei(pt.res);
        let SER1 = toWei(pt.SER1).toString();
        let Bi   = toWei(pt.Bi).toString();
        let Wi   = toWei(pt.Wi).toString();
        let Bo   = toWei(pt.Bo).toString();
        let Wo   = toWei(pt.Wo).toString();
        let fee  = toWei(pt.fee).toString();
        let desc = `${pt.res} ~= bMath.amountUpToPriceApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.amountUpToPriceApprox(Bi, Wi, Bo, Wo, SER1, fee).call()
            assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance);
        });
    }
 
    for( let pt of testPoints.swapImathPoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let Ai = toWei(pt.Ai).toString();
        let fee = toWei(pt.fee).toString();
        var desc = `${pt.res} ~= bMath.swapImath(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.swapImath(Bi, Wi, Bo, Wo, Ai, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }

    for( pt of testPoints.swapOmathPoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let Ao = toWei(pt.Ao).toString();
        let fee = toWei(pt.fee).toString();
        var desc = `${res} ~= bMath.swapOmath(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ao}, ${fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.deploy(web3, accts[0], "BalancerMath");
            var actual = await math.methods.swapOmath(Bi, Wi, Bo, Wo, Ao, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
});
