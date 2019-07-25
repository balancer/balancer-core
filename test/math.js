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
        throw "Bad argument";

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
    it("A few exact values", () => {
        assert.equal(1, getAmountOutForSell(2, 2, 2, 1, 1, 0));
        assert.equal(1000, getAmountOutForSell(2000, 2000, 2000, 1000, 1000, 0));
    });
});
