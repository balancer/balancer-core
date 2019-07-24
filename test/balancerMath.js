assert = require("assert");

WAD = 10**18;

function power(precision, numerator,denominator, exponent){
    result = precision;
    i = exponent;
    while(i!=0)
    {
        result = (result * numerator)/denominator;
        i = i - 1;
    }
    return result;
}

// Description: get qOut which is the amount of tokenOut a user gets when selling qIn tokenIn
// QOut = tokenOut Balance in pool
// QIn = tokenIn Balance in pool
// qIn = amount of tokenIn being sold
// wIn = tokenIn weight in pool
// wOut = tokenOut Balance of pool
function approximateAmountOutForSell(QOut, QIn, qIn, wIn, wOut){
    // Requirements
    if( QOut<=0 ||
        QIn<=0  ||
        qIn<=0 ||
        wIn<=0  ||
        wOut<=0)
        return -1;

    if (wIn>wOut)
    // Expand power into two, first with integer exponent >=1 and second with exponent <1
    {
        precision = uint256(10) ** 18; // TODO Use norm_factor from Balancer instead of precision
        integerPower = power(precision,QIn,QIn+qIn,wIn/wOut);
        return QOut - (integerPower * binExpqOut(QOut, QIn, qIn, wIn%wOut, wOut)/precision);
    }
    // Use binomial expansion directly since exponent <1
    else{
        return QOut-binExpqOut(QOut, QIn, qIn, wIn, wOut);
    }

}

 /**
 * @notice This function
 */
function binExpqOut(QOut, QIn, qIn, wIn, wOut){
    return QOut
        -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 1)
        -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 2)
        -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 3)
        -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 4)
        -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 5);
}

function BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, n){
    if(n == 0){
        return QOut;
    }else if(n == 1)
    {
        return (((QOut*wIn)/wOut)*qIn)/(QIn+qIn);
    }
    else{
        return ((((BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, n-1)*
            ((n-1)*wOut-wIn))/wOut)*qIn)/n)/(QIn+qIn);
    }
}

// Description: get qIn which is the amount of tokenIn a user gets when buying qOut tokenOut
// QOut = tokenOut Balance in pool
// QIn = tokenIn Balance in pool
// qOut = amount of tokenOut being bought
// wIn = tokenIn weight in pool
// wOut = tokenOut Balance of pool
function approximateAmountInForBuy(QOut, QIn, qOut, wIn, wOut){
    // Requirements
    if( QOut<=0 ||
        QIn<=0  ||
        qOut<=0 ||
        qOut>= QOut || // You can never buy all the balance of a token or more than it
        wIn<=0  ||
        wOut<=0)
        return -1;
    if (wOut>wIn)
    // Expand power into two, first with integer exponent >=1 and second with exponent <1
    {
        precision = uint256(10) ** 18; // TODO Use norm_factor from Balancer instead of precision
        integerPower = power(precision,QOut,QOut-qOut,wOut/wIn);
        return (integerPower * binExpqIn(QOut, QIn, qOut, wIn, wOut%wIn))/precision - QIn;
    }
    // Use binomial expansion directly since exponent <1
    else{
        return binExpqIn(QOut, QIn, qOut, wIn, wOut)-QIn;
    }

}

/**
 * @notice This function
 */
function binExpqIn(QOut, QIn, qOut, wIn, wOut){
    return QIn
        +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 1)
        -binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 2)
        +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 3)
        -binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 4)
        +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 5);
}

function binExpqInTermN(QOut, QIn, qOut, wIn, wOut, n){
    if(n == 0){
        return QIn;
    }else if(n == 1)
    {
        return (((QIn*wOut)/wIn)*qOut)/(QOut-qOut);
    }
    else{
        return ((((binExpqInTermN(QOut, QIn, qOut, wIn, wOut, n-1)*
            ((n-1)*wIn-wOut))/wIn)*qOut)/n)/(QOut-qOut);
    }
}

describe("Checking approximation math in plain js", () => {
    it("Exact (no rounding) amountOut for sell should be (2k WAD QOut & QIn)", () => {
        assert.equal(1e+21,
            approximateAmountOutForSell(
                                2000 * WAD,
                                2000 * WAD,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Exact (no rounding) amountIn for buy should be (2k WAD QOut & QIn)", () => {
        assert.equal(2e+21,
            approximateAmountInForBuy(
                                2000 * WAD,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000));
    });
    it("Exact (no rounding) amountOut for sell should be (2G WAD QOut & QIn)", () => {
        assert.equal(1e+27,
            approximateAmountOutForSell(
                                2000 * WAD * 10**6,
                                2000 * WAD * 10**6,
                                2000 * WAD * 10**6,
                                1000,
                                1000));
    });
    it("Exact (no rounding) amountIn for buy should be (2G WAD QOut & QIn)", () => {
        assert.equal(2e+27,
            approximateAmountInForBuy(
                                2000 * WAD * 10**6,
                                2000 * WAD * 10**6,
                                1000 * WAD * 10**6,
                                1000,
                                1000));
    });
    it("Exact (no rounding) amountOut for sell should be (WAD^WAD QOut & QIn)", () => {
        assert.equal(1e+39,
            approximateAmountOutForSell(
                                2000 * WAD * WAD,
                                2000 * WAD * WAD,
                                2000 * WAD * WAD,
                                1000,
                                1000));
    });
    it("Exact (no rounding) amountIn for buy should be (WAD^WAD QOut & QIn)", () => {
        assert.equal(2e+39,
            approximateAmountInForBuy(
                                2000 * WAD * WAD,
                                2000 * WAD * WAD,
                                1000 * WAD * WAD,
                                1000,
                                1000));
    });
    it("Truncated amountOut for sell should be (0.001 WAD QOut & QIn)", () => {
        assert.equal(90909090909090,
            Math.floor(approximateAmountOutForSell(
                                0.001*WAD,
                                0.001*WAD,
                                0.0001*WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountIn for should be (0.001 WAD QOut & QIn)", () => {
        assert.equal(111111111111111,
            Math.floor(approximateAmountInForBuy(
                                0.001*WAD,
                                0.001*WAD,
                                0.0001*WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountOut for sell should be (1 WAD QOut & QIn)", () => {
        assert.equal(90909090909090944,
            Math.floor(approximateAmountOutForSell(
                                WAD,
                                WAD,
                                0.1*WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountIn for should be (1 WAD QOut & QIn)", () => {
        assert.equal(111111111111111168,
            Math.floor(approximateAmountInForBuy(
                                WAD,
                                WAD,
                                0.1*WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountOut for sell should be (1K WAD QOut & QIn)", () => {
        assert.equal(90909090909090938880,
            Math.floor(approximateAmountOutForSell(
                                1000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountIn for should be (1K WAD QOut & QIn)", () => {
        assert.equal(111111111111111163904,
            Math.floor(approximateAmountInForBuy(
                                1000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountOut for sell should be (1G WAD QOut & QIn)", () => {
        assert.equal(90909090909090941534994432,
            Math.floor(approximateAmountOutForSell(
                                1000 * WAD * 10**6,
                                1000 * WAD * 10**6,
                                100 * WAD * 10**6,
                                1000,
                                1000)));
    });
    it("Truncated amountIn for buy should be (1G WAD QOut & QIn)", () => {
        assert.equal(111111111111111156491616256,
            Math.floor(approximateAmountInForBuy(
                                1000 * WAD * 10**6,
                                1000 * WAD * 10**6,
                                100 * WAD * 10**6,
                                1000,
                                1000)));
    });
    it("Truncated amountOut for sell should be (WAD^2 QOut & QIn)", () => {
        assert.equal(9485733738070600332972431684673732608,
            Math.floor(approximateAmountOutForSell(
                                1000 * WAD * WAD,
                                1000 * WAD * WAD,
                                100 * WAD * WAD,
                                1000,
                                1000)));
    });
    it("Truncated amountIn for buy should be (WAD^2 QOut & QIn)", () => {
        assert.equal(1867971990792442610111779333183436226560,
            Math.floor(approximateAmountInForBuy(
                                1000 * WAD * WAD,
                                1000 * WAD * WAD,
                                100 * WAD * WAD,
                                1000,
                                1000)));
    });
    it("Sell should fail for QOut = 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                0,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000));
    });
    it("Buy should fail for QOut = 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                0,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000));
    });
    it("Sell should fail for QIn = 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                0,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Buy should fail for QIn = 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                0,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Sell should fail for qIn = 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                0,
                                1000,
                                1000));
    });
    it("Buy should fail for qOut = 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                0,
                                1000,
                                1000));
    });
    it("Sell should fail for wIn = 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                0));
    });
    it("Buy should fail for wIn = 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                0,
                                1000));
    });
    it("Sell should fail for wOut = 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                0));
    });
    it("Buy should fail for wOut = 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                0));
    });
    it("Sell should fail for QOut < 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                -1000,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000));
    });
    it("Buy should fail for QOut < 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                -1000,
                                2000 * WAD,
                                1000 * WAD,
                                1000,
                                1000));
    });
    it("Sell should fail for QIn < 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                1000 * WAD,
                                -1000,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Buy should fail for QIn < 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                1000 * WAD,
                                -1000,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Sell should fail for qIn < 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                -1000,
                                1000,
                                1000));
    });
    it("Buy should fail for qOut < 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                -1000,
                                1000,
                                1000));
    });
    it("Sell should fail for wIn < 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                -1000,
                                1000));
    });
    it("Buy should fail for wIn < 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                -1000,
                                1000));
    });
    it("Sell should fail for wOut < 0 ", () => {
        assert.equal(-1,
            approximateAmountOutForSell(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                -1000));
    });
    it("Buy should fail for wOut < 0 ", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                100 * WAD,
                                1000,
                                -1000));
    });
    it("Buy should fail for qOut = QOut", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                2000 * WAD,
                                1000,
                                1000));
    });
    it("Buy should fail for qOut > QOut", () => {
        assert.equal(-1,
            approximateAmountInForBuy(
                                2000 * WAD,
                                1000 * WAD,
                                10000 * WAD,
                                1000,
                                1000));
    });
});

