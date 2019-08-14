// Bi := Balance of token In
// Bo := Balance of token Out
// Wi := Weight of token In
// Wo := Weight of token Out
// Ai := Amount of token In
module.exports.floatMath = {


    spotPrice: function(Bi, Wi, Bo, Wo) {
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");

        var numer = Bo/Wo;
        var denom = Bi/Wi;
        return numer/denom;
    },

    swapImathExact: function (Bi, Wi, Bo, Wo, Ai, fee) {
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");
        assert(Ai > 0, "Ai must be positive");
        assert(Ai < Bi, "Ai must be less than Bi" );
        assert(fee => 0, "fee must be nonnegative");
        assert(fee < 1, "fee must be less than one");

        var exponent = (Wi / Wo);
        var adjustedIn = Ai * (1-fee);
        var foo = Bi / (Bi + adjustedIn);
        var bar = foo**exponent;
        
        return Bo * (1 - bar);
    },

    swapImathApprox: function(Bi, Wi, Bo, Wo, Ai, fee) {
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");
        assert(Ai > 0, "Ai must be positive");
        assert(Ai < Bi, "Ai must be less than Bi" );
        assert(fee => 0, "fee must be nonnegative");
        assert(fee < 1, "fee must be less than one");

        assert( Ai < Bi, "Ai must be less than Bi" );
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
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");
        assert(Ao > 0, "Ao must be positive");
        assert(Ao < Bo, "Ao must be less than Bi" );
        assert(fee => 0, "fee must be nonnegative");
        assert(fee < 1, "fee must be less than one");

        var exponent = (Wo / Wi);
        var foo = Bo / (Bo - Ao);
        var bar = foo**exponent;
        
        return Bi * (1 - bar) / (1 - fee);
    },

    swapOmathApprox: function(Bi, Wi, Bo, Wo, Ao, fee) {
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");
        assert(Ao > 0, "Ao must be positive");
        assert(Ao < Bo, "Ao must be less than Bi" );
        assert(fee => 0, "fee must be nonnegative");
        assert(fee < 1, "fee must be less than one");

        var exponent = (Wo / Wi);
        var foo = Bo / (Bo - Ao);
        var bar = this.powApprox(foo, exponent);
        
        return Bi * (1 - bar) / (1 - fee);

    },

    spotPriceImathExact: function(SER0, SER1, Wi, Wo, Bi, fee) {
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;

        return (foo ** exponent - 1) * Bi;
    },


    spotPriceImathApprox: function(SER0, SER1, Wi, Wo, Bi, fee) {
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;
        return (this.powApprox(foo, exponent) - 1) * Bi;
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

        for( var k = 1; k < 12; k++ ) {
            numer    = numer * (a - (k-1)) * x;
            denom    = denom * k;
            sum     += numer / denom;
        }

        return sum * wholePow;
    },


}
