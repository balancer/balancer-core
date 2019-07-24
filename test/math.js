assert = require("assert");

// Description: get qOut which is the amount of tokenOut a user gets when selling qIn tokenIn
// QOut = tokenOut Balance in pool
// QIn = tokenIn Balance in pool
// qIn = amount of tokenIn being sold
// wIn = tokenIn weight in pool
// wOut = tokenOut Balance of pool
// fee = pool fee
function getAmountOutForSell(QOut, QIn, qIn, wIn, wOut, fee){
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
    return (((QOut/(QOut-qOut))**(wOut/wIn)-1)*QIn)/(1-fee)
}

QOut = 1000 * 10**18;
QIn = 1000 * 10**18;
qOut = 100 * 10**18;
qIn =  100 * 10**18;
qOut =  100 * 10**18;
wIn = 1000;
wOut = 1000;
fee = 0.001; // 1%

describe("plain js math", () => {
    it("amountOut for sell should be", () => {
        assert.equal(90826438767160672256, Math.floor(getAmountOutForSell(QOut, QIn, qIn, wIn, wOut, fee)));
    });
    it("amountIn for buy should be", () => {
        assert.equal(111222333444555718656, Math.floor(getAmountInForBuy(QOut, QIn, qOut, wIn, wOut, fee)));
    });
});
