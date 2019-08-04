// Bi := Balance of token In
// Bo := Balance of token Out
// Wi := Weight of token In
// Wo := Weight of token Out
// Ai := Amount of token In

module.exports.floatMath = {

    spotPrice: function(Bo, Bi, Wi, Wo) {
        if( Bo<=0 || Bi<=0 || Wi<=0 || Wo<=0) {
            throw "Bad argument";
        }
        var numer = Bo/Wo;
        var denom = Bi/Wi;
        return numer/denom;
    },

    swapImathExact: function (Bo, Bi, Ai, Wi, Wo, fee) {
        if( Bo<=0 || Bi<=0 || Ai<=0 || Wi<=0 || Wo<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (Wi / Wo);
        var adjustedIn = Ai * (1-fee);
        var foo = Bi / (Bi + adjustedIn);
        var bar = foo**exponent;
        
        return Bo * (1 - bar);
    },

    swapImathApprox: function(Bo, Bi, Ai, Wi, Wo) {
        // let partial = Wi % Wo;
        // let integer = (Wi / Wo) - partial;
        let a = Wi / Wo;
        let x = (Bi / (Bi + Ai)) - 1;

        // term 0:
        var numer = 1;
        var denom = 1;
        var sum = 1;
        for( var k = 1; k < 8; k++ ) {
            numer = numer * (a - (k-1)) * (x**k);
            denom = denom * k;
            sum += numer / denom;
        }
        return Bo * sum;
    }
}

