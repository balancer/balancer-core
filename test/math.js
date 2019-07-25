assert = require("assert");
var bMath = require("../src/math.js")

describe("math.js", () => {
    it("working exact", () => {
        // Weight ratio 1
        assert.equal(1, bMath.swapSpecifyInMath(2, 2, 2, 1, 1, 0));
        // Weight ratio 1
        assert.equal(10, bMath.swapSpecifyInMath(20, 20, 20, 10, 10, 0));
        // Weight ratio 2
        assert.equal(15, bMath.swapSpecifyInMath(20, 20, 20, 2, 1, 0));
        // Weight ratio 3
        assert.equal(14, bMath.swapSpecifyInMath(16, 16, 16, 3, 1, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/10
        assert.equal(1, bMath.swapSpecifyInMath(2, 1, 1031, 1, 10, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/2
        assert.equal(10, bMath.swapSpecifyInMath(30, 4, 5, 1, 2, 0));
    });
    it("should be working exact", () => {
        // Weight ratio 1/3
        assert.equal(30, bMath.swapSpecifyInMath(90, 8, 19, 1, 3, 0)); 
    });
    it("should be working exact", () => {
        // Weight ratio 10
        assert.equal(1031, bMath.swapSpecifyInMath(1032, 500, 500, 10, 1, 0));
    })
    it("working _Approx", () => {
        assert.equal(1, bMath.swapSpecifyInMath_Approx(2, 2, 2, 1, 1, 0));
        assert.equal(10, bMath.swapSpecifyInMath_Approx(20, 20, 20, 10, 10, 0));
         // Weight ratio 2
        assert.equal(15, bMath.swapSpecifyInMath_Approx(20, 20, 20, 2, 1, 0));

    });
    it("should be working _Approx", () => {
        // Weight ratio 10
        assert.equal(270, bMath.swapSpecifyInMath_Approx(1000, 500, 16, 10, 1, 0)); 
    });
    it("should be working _Approx", () => {
        // MAX Weight ratio 100
        assert.equal(10, bMath.swapSpecifyInMath_Approx(2000, 1000, 50, 100, 1, 0)); 
    });


    it("should throw for bad arguments", () => {
        assert.throws(() => {
            bMath.swapSpecifyInMath(10, 10, 11, 1, 0);
        });
        assert.throws(() => {
            bMath.swapSpecifyInMath(0, 0, 1, 1, 1);
        });
    });
});
