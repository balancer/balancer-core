assert = require("assert");

function binomExpansion() {
    return 1;
}

describe("plain js math", () => {
    it("binomial expansion", () => {
        assert.equal(1, binomExpansion());
    });
    it("buy amount formula", () => {
        assert.equal(2, binomExpansion());
    });
});
