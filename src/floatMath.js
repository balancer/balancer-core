// Bi := Balance of token In
// Bo := Balance of token Out
// Wi := Weight of token In
// Wo := Weight of token Out
// Ai := Amount of token In
module.exports.floatMath = {

    spotPrice: function(Bi, Wi, Bo, Wo) {
        if( Bo<=0 || Bi<=0 || Wi<=0 || Wo<=0) {
            throw "Bad argument";
        }
        var numer = Bo/Wo;
        var denom = Bi/Wi;
        return numer/denom;
    },

    swapImathExact: function (Bi, Wi, Bo, Wo, Ai, fee) {
        if( Bo<=0 || Bi<=0 || Ai<=0 || Wi<=0 || Wo<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        if( Ai >= Bi ) {
            throw new Error("Ai must be less than Bi");
        }
        var exponent = (Wi / Wo);
        var adjustedIn = Ai * (1-fee);
        var foo = Bi / (Bi + adjustedIn);
        var bar = foo**exponent;
        
        return Bo * (1 - bar);
    },

    swapImathApprox: function(Bi, Wi, Bo, Wo, Ai, fee) {
        if( Ai >= Bi ) {
            throw new Error("Ai must be less than Bi");
        }
        if( Bo<=0 || Bi<=0 || Ai<=0 || Wi<=0 || Wo<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (Wi / Wo);
        var adjustedIn = Ai * (1-fee);
        var foo = Bi / (Bi + adjustedIn);
        var bar = this.powApprox(foo, exponent);
        
        return Bo * (1 - bar);

    },
    
    swapOmathExact: function (Bi, Wi, Bo, Wo, Ao, fee) {
        if( Bo<=0 || Bi<=0 || Ao<=0 || Wi<=0 || Wo<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (Wo / Wi);
        var foo = Bo / (Bo - Ao);
        var bar = foo**exponent;
        
        return Bi * (1 - bar) / (1 - fee);
    },

    swapOmathApprox: function(Bi, Wi, Bo, Wo, Ao, fee) {
        if( Bo<=0 || Bi<=0 || Ao<=0 || Wi<=0 || Wo<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (Wo / Wi);
        var foo = Bo / (Bo - Ao);
        var bar = this.powApprox(foo, exponent);
        
        return Bi * (1 - bar) / (1 - fee);

    },

    powApprox: function(base, exponent) {
        let x = base - 1;
   
        let whole = Math.floor(exponent);   
        let remain = exponent - whole;
        let wholePow = base ** whole;

        if (remain == 0) {
            return wholePow;
        }
     
        // term 0:
        var a     = remain;
        var numer = 1;
        var denom = 1;
        var sum   = 1;

        for( var k = 1; k < 8; k++ ) {
            numer    = numer * (a - (k-1)) * x;
            denom    = denom * k;
            sum     += numer / denom;
        }

        assert.closeTo(base**exponent, sum * wholePow, 0.001);
        return sum * wholePow;
    }

}
