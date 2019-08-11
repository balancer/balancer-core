assert = require("chai").assert;
var math = require("../src/floatMath.js")
var fMath = math.floatMath;

let tolerance = 0.00001;

describe("math.js", () => {
    it("1 == swapIMathExact(...)", () => {
        Bi = 2; Wi = 1;
        Bo = 2; Wo = 1;
        Ai = 2; fee = 0;
        Ao = 1;
        assert.equal(Ao, fMath.swapImathExact(Bi, Wi, Bo, Wo, Ai, fee));
    });
    it("swapImathExact ", () => {
        // Weight ratio 1
        // Weight ratio 1
        assert.equal(10, fMath.swapImathExact(20, 20, 20, 10, 10, 0));
        // Weight ratio 2
        assert.equal(15, fMath.swapImathExact(20, 20, 20, 2, 1, 0));
        // Weight ratio 3
        assert.equal(14, fMath.swapImathExact(16, 16, 16, 3, 1, 0));
    });
    it("swapImathExact ratio < 1", () => {
        // Weight ratio 1/2
        assert.closeTo(10, fMath.swapImathExact(30, 4, 5, 1, 2, 0), tolerance);
        // Weight ratio 1/3
        assert.closeTo(30, fMath.swapImathExact(90, 8, 19, 1, 3, 0), tolerance); 
    });
    it("swapImathApprox ratio < 1", () => {
        assert.closeTo(1, fMath.swapImathApprox(2, 2, 2, 1, 1, 0), tolerance);
        assert.closeTo(10, fMath.swapImathApprox(20, 20, 20, 10, 10, 0), tolerance);
    });

    it("swapIMathApprox ratio > 1", () => {
         // Weight ratio 2
        assert.closeTo(15, fMath.swapImathApprox(20, 20, 20, 2, 1, 0), tolerance);
         // Weight ratio 3
        assert.closeTo(14, fMath.swapImathApprox(16, 16, 16, 3, 1, 0), tolerance);
    });
    it("whitepaper spotPrice points", () => {
        var weights  = [0.5, 0.2, 0.3];
        var balances = [10, 1, 6000];
        var expected = [4, 0.001, 0.00025];
        var testIdx  = 0;
        for (var i = 0; i < expected.length - 1; i++) {
            var j = i + 1;
            for (; j < expected.length; j++) {
                assert.closeTo(fMath.spotPrice(balances[i], weights[i], balances[j], weights[j]), expected[testIdx++], tolerance);
            }
        }
    });

    it("should throw for bad arguments", () => {
        var good = [2,2,1,1,0.01];
        for (var k = 0; k < 4; k++) {
            bad    = [].concat(good);
            bad[k] = 0;
            assert.throws(() => { fMath.swapImathExact.apply(null, bad); });
        }
    });
});
