const Decimal = require('decimal.js');

function calcRelativeDiff(expected, actual) {
    return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

function calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee) {
  let weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
  let adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
  let y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
  let foo = y.pow(weightRatio);
  let bar = Decimal(1).minus(foo);
  let tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
  return tokenAmountOut;
}

function calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee) {
  let weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
  let diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
  let y = Decimal(tokenBalanceOut).div(diff);
  let foo = y.pow(weightRatio).minus(Decimal(1));
  let tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
  return tokenAmountIn;
}

module.exports = {
  calcOutGivenIn,
  calcRelativeDiff
}