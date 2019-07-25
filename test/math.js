assert = require("assert");
var bMath = require("../src/math.js")

describe("Checking exact math in plain js", () => {
    it("A few exact values", () => {
        assert.equal(1, bMath.getAmountOutForSell(2, 2, 2, 1, 1, 0));
        assert.equal(10, bMath.getAmountOutForSell(20, 20, 20, 10, 10, 0));
    });
    it("should throw for bad arguments", () => {
        assert.throws(() => {
            bMath.getAmountOutForSell(10, 10, 11, 1, 0);
        }, new Error("Invalid arguments"));
    });
});
