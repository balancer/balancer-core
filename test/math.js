assert = require("assert");
var math = require("../src/math.js")
var fMath = math.floatMath;

let tolerance = 0.001;
function approxEq(a, b) {
    console.log(a, b);
    assert(Math.abs(a-b) < a*tolerance);
}

describe("floatMath", () => {
    it("fAdd, fSub, fMul, fDiv", () => {
    });
});

describe("math.js", () => {
    it("working exact", () => {
        // Weight ratio 1
        assert.equal(1, fMath.swapImath(2, 2, 2, 1, 1, 0));
        // Weight ratio 1
        assert.equal(10, fMath.swapImath(20, 20, 20, 10, 10, 0));
        // Weight ratio 2
        assert.equal(15, fMath.swapImath(20, 20, 20, 2, 1, 0));
        // Weight ratio 3
        assert.equal(14, fMath.swapImath(16, 16, 16, 3, 1, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/10
        approxEq(1, fMath.swapImath(2, 1, 1031, 1, 10, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/2
        approxEq(10, fMath.swapImath(30, 4, 5, 1, 2, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/3
        approxEq(30, fMath.swapImath(90, 8, 19, 1, 3, 0)); 
    });
    it("should be working exact", () => {
        // Weight ratio 10
        approxEq(1031, fMath.swapImath(1032, 500, 500, 10, 1, 0));
    })
    it("working _Approx", () => {
        approxEq(1, fMath.swapImath_Approx(2, 2, 2, 1, 1, 0));
        approxEq(10, fMath.swapImath_Approx(20, 20, 20, 10, 10, 0));
         // Weight ratio 2
        approxEq(15, fMath.swapImath_Approx(20, 20, 20, 2, 1, 0));

    });
    it("should be working _Approx", () => {
        // Weight ratio 10
        approxEq(270, fMath.swapImath_Approx(1000, 500, 16, 10, 1, 0)); 
    });
    it("should be working _Approx", () => {
        // MAX Weight ratio 100
        approxEq(1984.79, fMath.swapImath_Approx(2000, 1000, 50, 100, 1, 0)); 
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
