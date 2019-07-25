assert = require("assert");
var bMath = require("../src/math.js")

describe("Checking exact math in plain js", () => {
    it("A few exact values", () => {
        assert.equal(1, bMath.swapSpecifyInMath(2, 2, 2, 1, 1, 0)); // Weight ratio 1
        assert.equal(10, bMath.swapSpecifyInMath(20, 20, 20, 10, 10, 0)); // Weight ratio 1

        assert.equal(15, bMath.swapSpecifyInMath(20, 20, 20, 2, 1, 0)); // Weight ratio 2
        assert.equal(16, bMath.swapSpecifyInMath(16, 16, 16, 3, 1, 0)); // Weight ratio 3
        assert.equal(270, bMath.swapSpecifyInMath(1000, 500, 16, 10, 1, 0)); // Weight ratio 10
        assert.equal(10, bMath.swapSpecifyInMath(2000, 1000, 50, 100, 1, 0)); // MAX Weight ratio 100
    });
    it("Exact values for some approximation points", () => {
        assert.equal(1, bMath.swapSpecifyInMath_Approx(2, 2, 2, 1, 1, 0));
        assert.equal(10, bMath.swapSpecifyInMath_Approx(20, 20, 20, 10, 10, 0));


        assert.equal(15, bMath.swapSpecifyInMath_Approx(20, 20, 20, 2, 1, 0)); // Weight ratio 2

    });
    it("Exact values for some approximation points", () => {
        assert.equal(270, bMath.swapSpecifyInMath_Approx(1000, 500, 16, 10, 1, 0)); // Weight ratio 10
    });
    it("Exact values for some approximation points", () => {
        assert.equal(10, bMath.swapSpecifyInMath_Approx(2000, 1000, 50, 100, 1, 0)); // MAX Weight ratio 100
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
