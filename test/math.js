assert = require("assert");
var bMath = require("../src/math.js")

describe("Checking exact math in plain js", () => {
    it("A few exact values", () => {
        console.log(bMath);
        assert.equal(1, bMath.getAmountOutForSell(2, 2, 2, 1, 1, 0));
        assert.equal(1000, bMath.getAmountOutForSell(2000, 2000, 2000, 1000, 1000, 0));
    });
    it("should throw for bad arguments", () => {
        assert.throws(() => {
            bMath.getAmountOutForSell(10, 10, 11, 1, 0);
        }, new Error("Invalid arguments"));
    });
});
