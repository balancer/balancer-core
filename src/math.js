// Javascript implementation of BalanceMath functions
// Only test numbers that have exact decimal representations
// and stay within the Number type range
//
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
module.exports.swapSpecifyInMath = (QOut, QIn, qIn, wIn, wOut, fee) => {
    if( QOut<=0 ||
        QIn<=0  ||
        qIn<=0 ||
        wIn<=0  ||
        wOut<=0 ||
        fee>=1)
        throw new Error("Invalid arguments");
    return (1-(QIn/(QIn+qIn*(1-fee)))**(wIn/wOut))*QOut;
}


