assert = require("chai").assert;
var math = require("../src/floatMath.js")
var fMath = math.floatMath;

let approxTolerance = 0.00001;
let floatEqTolerance = 0.00000000001

describe("floatMath.js", function () {
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
        assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 1, 1, 0); });
    });
    it("should throw if any arg except fee is 0", () => {
        var good = [2,2,1,1,0.01];
        for (var k = 0; k < 4; k++) {
            bad    = [].concat(good);
            bad[k] = 0;
            assert.throws(() => { fMath.swapImathExact.apply(null, bad); });
        }
    });

});
