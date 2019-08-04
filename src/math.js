
module.exports.floatMath = {

    // Description: get the spotExchangeRate,
    // i.e. how many tokenOuts a trader gets for one tokenIn.
    // There is no slippage in this calculation.
    spotPrice: function(OBalance, IBalance, IWeight, OWeight) {
        // Requirements
        if( OBalance<=0 || IBalance<=0 || IWeight<=0 || OWeight<=0) {
            throw "Bad argument";
        }
        var numer = OBalance/OWeight;
        var denom = IBalance/IWeight;
        return numer/denom;
    },

    // Description: get qOut which is the amount of tokenOut a user gets when selling IAmount tokenIn
    swapImathExact: function (OBalance, IBalance, IAmount, IWeight, OWeight, fee) {
        if( OBalance<=0 || IBalance<=0 || IAmount<=0 || IWeight<=0 || OWeight<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (IWeight / OWeight);
        var adjustedIn = IAmount * (1-fee);
        var foo = IBalance / (IBalance + adjustedIn);
        var bar = foo**exponent;
        
        return OBalance * (1 - bar);
    },

    // Unrolled form of approximation paper
    swapImathApprox: function(OBalance, IBalance, IAmount, IWeight, OWeight) {
        // let partial = IWeight % OWeight;
        // let integer = (IWeight / OWeight) - partial;
        let a = IWeight / OWeight;
        let x = (IBalance / (IBalance + IAmount)) - 1;

        // term 0:
        var numer = 1;
        var denom = 1;
        var sum = 1;
        for( var k = 1; k < 8; k++ ) {
            numer = numer * (a - (k-1)) * (x**k);
            denom = denom * k;
            sum += numer / denom;
        }
        return OBalance * sum;
    }

}

