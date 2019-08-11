assert = require("chai").assert;
var math = require("../src/floatMath.js")
var fMath = math.floatMath;

let tolerance = 0.00001;

describe("floatMath.js", function () {
    // result, Bi, Wi, Bo, Wo, Ai, fee
    var swapImathPoints = [
        [1, 2, 1, 2, 1, 2, 0],
        [10, 20, 10, 20, 10, 20, 0],
        [15, 20, 2, 20, 1, 20, 0],
        [14, 16, 3, 16, 1, 16, 0],
    ]
    for( pt of swapImathPoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        let Ai = pt[5]; let fee = pt[6];
        var desc = `${res} == swapIMathExact(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, function () {
            assert.equal(res, fMath.swapImathExact(Bi, Wi, Bo, Wo, Ai, fee));
        });
    }
    for( pt of swapImathPoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        let Ai = pt[5]; let fee = pt[6];
        var desc = `${res} ~= swapIMathApprox(${Bi}, ${Wi}, ${Bo}, ${Wo}, ${Ai}, ${fee})`;
        it(desc, function () {
            assert.closeTo(res, fMath.swapImathApprox(Bi, Wi, Bo, Wo, Ai, fee), tolerance);
        });
    }

    // Result, Bi, Wi, Bo, Wo
    var spotPricePoints = [
        [0, 10, 0.5, 1, 0.2],
        [0, 1, 0.2, 10, 0.5],

        [0, 1, 0.2, 6000, 0.3],
        [0, 6000, 0.3, 1, 0.2],

        [0, 6000, 0.3, 10, 0.5],
        [0, 10, 0.5, 6000, 0.3]
    ];

    for( pt of spotPricePoints ) {
        let res = pt[0];
        let Bi = pt[1]; let Wi = pt[2];
        let Bo = pt[3]; let Wo = pt[4];
        var desc = `${res} ~= spotPrice(${Bi}, ${Wi}, ${Bo}, ${Wo})`;
        it(desc, function () {
            assert.closeTo(res, fMath.spotPrice(Bi, Wi, Bo, Wo), tolerance);
        });
    }

    it("should throw for bad arguments", () => {
        var good = [2,2,1,1,0.01];
        for (var k = 0; k < 4; k++) {
            bad    = [].concat(good);
            bad[k] = 0;
            assert.throws(() => { fMath.swapImathExact.apply(null, bad); });
        }
    });
});
