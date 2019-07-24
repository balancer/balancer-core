assert = require("assert");

WAD = 10**18;
// Description: get qOut which is the amount of tokenOut a user gets when selling qIn tokenIn
// QOut = tokenOut Balance in pool
// QIn = tokenIn Balance in pool
// qIn = amount of tokenIn being sold
// wIn = tokenIn weight in pool
// wOut = tokenOut Balance of pool
// fee = pool fee
function getAmountOutForSell(QOut, QIn, qIn, wIn, wOut, fee){
    if( QOut<=0 ||
        QIn<=0  ||
        qIn<=0 ||
        wIn<=0  ||
        wOut<=0 ||
        fee>=1)
        return -1;
    return (1-(QIn/(QIn+qIn*(1-fee)))**(wIn/wOut))*QOut;
}

// Description: get qIn which is the amount of tokenIn a user gets when buying qOut tokenOut
// QOut = tokenOut Balance in pool
// QIn = tokenIn Balance in pool
// qOut = amount of tokenOut being bought
// wIn = tokenIn weight in pool
// wOut = tokenOut Balance of pool
// fee = pool fee
function getAmountInForBuy(QOut, QIn, qOut, wIn, wOut, fee){
    if( QOut<=0 ||
        QIn<=0  ||
        qOut<=0 ||
        qOut>= QOut || // You can never buy all the balance of a token or more than it
        wIn<=0  ||
        wOut<=0 ||
        fee>=1)
        return -1;
    return (((QOut/(QOut-qOut))**(wOut/wIn)-1)*QIn)/(1-fee);
}

describe("Checking exact math in plain js", () => {
    it("Truncated amountOut for sell should be (1K WAD QOut & QIn)", () => {
        assert.equal(90826438767160672256,
            Math.floor(getAmountOutForSell(
                                1000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                1000,
                                0.001)));
    });
    it("Truncated amountIn for buy should be (1K WAD QOut & QIn)", () => {
        assert.equal(111222333444555718656,
            Math.floor(getAmountInForBuy(
                                1000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                1000,
                                0.001)));
    });
    it("Truncated amountOut for sell should be (1G WAD QOut & QIn)", () => {
        assert.equal(90826438767160567384768512,
            Math.floor(getAmountOutForSell(
                                1000 * WAD * 10**6,
                                1000 * WAD * 10**6,
                                100 * WAD * 10**6,
                                1000,
                                1000,
                                0.001)));
    });
    it("Truncated amountIn for buy should be (1G WAD QOut & QIn)", () => {
        assert.equal(111222333444555706975911936,
            Math.floor(getAmountInForBuy(
                                1000 * WAD * 10**6,
                                1000 * WAD * 10**6,
                                100 * WAD * 10**6,
                                1000,
                                1000,
                                0.001)));
    });
    it("Truncated amountOut for sell should be (WAD^2 QOut & QIn)", () => {
        assert.equal(90826438767160680262349709423304245248,
            Math.floor(getAmountOutForSell(
                                1000 * WAD * WAD,
                                1000 * WAD * WAD,
                                100 * WAD * WAD,
                                1000,
                                1000,
                                0.001)));
    });
    it("Truncated amountIn for buy should be (WAD^2 QOut & QIn)", () => {
        assert.equal(111222333444555708519658631019825725440,
            Math.floor(getAmountInForBuy(
                                1000 * WAD * WAD,
                                1000 * WAD * WAD,
                                100 * WAD * WAD,
                                1000,
                                1000,
                                0.001)));
    });
    it("Exact (no rounding) amountOut for sell should be", () => {
        assert.equal(1000 * WAD,
            getAmountOutForSell(
                                2000 * WAD,
                                2000 * WAD,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Exact (no rounding) amountIn for buy should be", () => {
        assert.equal(2000 * WAD,
            getAmountInForBuy(
                                2000 * WAD,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for QOut = 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                0,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for QOut = 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                0,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for QIn = 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                1000 * WAD,
                                0,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for QIn = 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                1000 * WAD,
                                0,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for qIn = 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                0,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for qOut = 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                0,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for wIn = 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                0,
                                1000,
                                0));
    });
    it("Buy should fail for wIn = 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                0,
                                1000,
                                0));
    });
    it("Sell should fail for wOut = 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                0,
                                0));
    });
    it("Buy should fail for wOut = 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                0,
                                0));
    });
    it("Sell should fail for QOut < 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                -1000,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for QOut < 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                -1000,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for QIn < 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                1000 * WAD,
                                -1000,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for QIn < 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                1000 * WAD,
                                -1000,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for qIn < 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                -1000,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for qOut < 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                -1000,
                                1000,
                                1000,
                                0));
    });
    it("Sell should fail for wIn < 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                -1000,
                                1000,
                                0));
    });
    it("Buy should fail for wIn < 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                -1000,
                                1000,
                                0));
    });
    it("Sell should fail for wOut < 0 ", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                -1000,
                                0));
    });
    it("Buy should fail for wOut < 0 ", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                -1000,
                                0));
    });
    it("Buy should fail for qOut = QOut", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for qOut > QOut", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                10000 * WAD,
                                1000,
                                1000,
                                0));
    });
    it("Buy should fail for fee = 1", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000,
                                1));
    });
    it("Buy should fail for fee > 1", () => {
        assert.equal(-1,
            getAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                10000 * WAD,
                                1000,
                                1000,
                                2));
    });
    it("Sell should fail for fee = 1", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000,
                                1));
    });
    it("Sell should fail for fee > 1", () => {
        assert.equal(-1,
            getAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                10000 * WAD,
                                1000,
                                1000,
                                2));
    });
});

