assert = require("assert");
var bMath = require("../src/math.js")

describe("Checking exact math in plain js", () => {
    it("A few exact values", () => {
        assert.equal(1, bMath.swapSpecifyInMath(2, 2, 2, 1, 1, 0));
        assert.equal(10, bMath.swapSpecifyInMath(20, 20, 20, 10, 10, 0));
    });
    it("Exact values for some approximation points", () => {
        assert.equal(1, bMath.swapSpecifyInMath_Approx(2, 2, 2, 1, 1, 0));
        assert.equal(10, bMath.swapSpecifyInMath(20, 20, 20, 10, 10, 0));
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
