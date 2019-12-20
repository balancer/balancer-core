const Decimal = require('decimal.js');

function calcRelativeDiff(expected, actual) {
    return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

function calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee) {
    const weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
    const adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
    const y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
    const foo = y.pow(weightRatio);
    const bar = Decimal(1).minus(foo);
    const tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
    return tokenAmountOut;
}

function calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee) {
    const weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
    const diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
    const y = Decimal(tokenBalanceOut).div(diff);
    const foo = y.pow(weightRatio).minus(Decimal(1));
    const tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
    return tokenAmountIn;
}

module.exports = {
    calcOutGivenIn,
    calcInGivenOut,
    calcRelativeDiff,
};
