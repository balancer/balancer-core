module.exports.floatMath = {

    // Description: get the spotExchangeRate, i.e. how many tokenOuts a trader gets for one tokenIn,
    //      there is no slippage in this calculation
    // QOut = tokenOut Balance in pool
    // QIn = tokenIn Balance in pool
    // wIn = tokenIn weight in pool
    // wOut = tokenOut Balance of pool
    spotPrice: function(QOut, QIn, wIn, wOut) {
        // Requirements
        if( QOut<=0 || QIn<=0 || wIn<=0 || wOut<=0) {
            throw "Bad argument";
        }
        return (QOut/wOut)/(QIn/wIn);
    },

    // Description: get qOut which is the amount of tokenOut a user gets when selling qIn tokenIn
    // QOut = tokenOut Balance in pool
    // QIn = tokenIn Balance in pool
    // qIn = amount of tokenIn being sold
    // wIn = tokenIn weight in pool
    // wOut = tokenOut Balance of pool
    // fee = pool fee
    swapImath: function (QOut, QIn, qIn, wIn, wOut, fee) {
        if( QOut<=0 || QIn<=0 || qIn<=0 || wIn<=0 || wOut<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (wIn / wOut);
        var adjustedIn = qIn * (1-fee);
        return QOut * (1-(QIn/(QIn+adjustedIn))**exponent)
    },

    // Description: get qOut which is the amount of tokenOut a user gets when selling qIn tokenIn
    // QOut = tokenOut Balance in pool
    // QIn = tokenIn Balance in pool
    // qIn = amount of tokenIn being sold
    // wIn = tokenIn weight in pool
    // wOut = tokenOut Balance of pool
    swapImath_Approx: function(QOut, QIn, qIn, wIn, wOut) {
        // Requirements
        if( QOut<=0 || QIn<=0 || qIn<=0 || wIn<=0 || wOut<=0) {
            throw "Bad argument";
        }

        if (wIn>wOut) {
            // Expand power into two
            // first with integer exponent >=1
            // then with exponent <1
            var floored = Math.floor(wIn/wOut);
            var fractional = (wIn/wOut) - floored
            integerPower = (QIn/(QIn+qIn)) ** floored
            return QOut - (integerPower * this.binExpqOut(QOut, QIn, qIn, fractional, wOut));
        } else {
            // Use binomial expansion directly since exponent <1
            return QOut-this.binExpqOut(QOut, QIn, qIn, wIn, wOut);
        }

    },

    binExpqOut: function(QOut, QIn, qIn, wIn, wOut) {
        return QOut
            -this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 1)
            -this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 2)
            -this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 3)
            -this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 4)
            -this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 5);
    },

    BinExpqOutTermN: function(QOut, QIn, qIn, wIn, wOut, n) {
        if(n == 0){
            return QOut;
        } else if(n == 1) {
            return (((QOut*wIn)/wOut)*qIn)/(QIn+qIn);
        } else {
            var binExp = this.BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, n-1);
            return ((((binExp*(n-1)*(wOut-wIn))/wOut)*qIn)/n)/(QIn+qIn);
        }
    }
}

