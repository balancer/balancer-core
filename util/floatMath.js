// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

let assert = require('chai').assert;

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

    calc_OutGivenInExact: function (Bi, Wi, Bo, Wo, Ai, fee) {
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

    calc_OutGivenIn: function() {
        return module.exports.floatMath.calc_OutGivenInApprox(...arguments);
    },
    calc_OutGivenInApprox: function(Bi, Wi, Bo, Wo, Ai, fee) {
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
   
    calc_InGivenOutExact: function (Bi, Wi, Bo, Wo, Ao, fee) {
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
        
        return Bi * (bar - 1) / (1 - fee);
    },

    calc_InGivenOut: function() {
        return module.exports.floatMath.calc_InGivenOutApprox(...arguments);
    },
    calc_InGivenOutApprox: function(Bi, Wi, Bo, Wo, Ao, fee) {
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
        
        return Bi * (bar - 1) / (1 - fee);

    },

    amountUpToPriceExact: function(Bi, Wi, Bo, Wo, SER1, fee) {
        var SER0 = this.spotPrice(Bi, Wi, Bo, Wo);
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;

        return (foo ** exponent - 1) * Bi / (1 - fee);
    },

    amountUpToPrice: function() {
        return module.exports.floatMath.amountUpToPriceApprox(...arguments);
    },
    amountUpToPriceApprox: function(Bi, Wi, Bo, Wo, SER1, fee) {
        var SER0 = this.spotPrice(Bi, Wi, Bo, Wo);
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;
        var Ai  = (this.powApprox(foo, exponent) - 1) * Bi
        return Ai / (1 - fee);
    },

    powApprox: function(base, exponent) {
        assert(base <= 2, "base must be <= 2 for powApprox");
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

        for( var k = 1; k < 100; k++ ) {
            numer    = numer * (a - (k-1)) * x;
            denom    = denom * k;
            sum     += numer / denom;
        }

        return sum * wholePow;
    },

    getValue: function(tokenList) {
        if (tokenList.length == 0) return 0;
        let res = 1;
        for (let token of tokenList) {
            res *= Math.pow(token[0], token[1]);
        }
        return res;
    },

    getRefSpotPrice: function(Bo, Wo, tokens) {
        return (Bo/Wo) / this.getValue(tokens);
    },

    getTotalWeight: function(tokens) {
        let res = 0;
        for (let token of tokens) {
            res += token[1];
        }
        return res;
    },

    getNormalizedWeight: function(W, tokens) {
        let totalWeight = this.getTotalWeight(tokens);
        if (totalWeight == 0) return 0;
        return W/totalWeight;
    },

}
