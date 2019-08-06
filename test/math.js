assert = require("chai").assert;
var math = require("../src/floatMath.js")
var fMath = math.floatMath;

let tolerance = 0.00001;

describe("math.js", () => {
    it("working exact", () => {
        // Weight ratio 1
        assert.equal(1, fMath.swapImathExact(2, 2, 2, 1, 1, 0));
        // Weight ratio 1
        assert.equal(10, fMath.swapImathExact(20, 20, 20, 10, 10, 0));
        // Weight ratio 2
        assert.equal(15, fMath.swapImathExact(20, 20, 20, 2, 1, 0));
        // Weight ratio 3
        assert.equal(14, fMath.swapImathExact(16, 16, 16, 3, 1, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/2
        assert.closeTo(10, fMath.swapImathExact(30, 4, 5, 1, 2, 0), tolerance);
    });
    it("should be working exact", () => {
        // Weight ratio 1/3
        assert.closeTo(30, fMath.swapImathExact(90, 8, 19, 1, 3, 0), tolerance); 
    });
     it("working _Approx2", () => {
        assert.closeTo(1, fMath.swapImathApprox(2, 2, 2, 1, 1, 0), tolerance);
        assert.closeTo(10, fMath.swapImathApprox(20, 20, 20, 10, 10, 0), tolerance);
    });
    it("broken _Approx2 - ratio > 1", () => {
         // These don't work because the approx formula is still
         // only the <1 case
         // Weight ratio 2
        assert.closeTo(15, fMath.swapImathApprox(20, 20, 20, 2, 1, 0), tolerance);
         // Weight ratio 3
        assert.closeTo(14, fMath.swapImathApprox(16, 16, 16, 3, 1, 0), tolerance);
    });
    

    it("should throw for bad arguments", () => {
        assert.throws(() => {
            fMath.swapImath(10, 10, 11, 1, 0);
        });
        assert.throws(() => {
            fMath.swapImath(0, 0, 1, 1, 1);
        });
    });
});
