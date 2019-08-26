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

// Bi := Balance of token In
// Bo := Balance of token Out
// Wi := Weight of token In
// Wo := Weight of token Out
// Ai := Amount of token In
let bconst = require("./constant.js");
let berr   = require("./error.js");
module.exports.floatMath = {
    mathCheck: function(Bi, Wi, Bo, Wo, fee) {
        assert(Bi > 0, "Bi must be positive");
        assert(Wi > 0, "Wi must be positive");
        assert(Bo > 0, "Bo must be positive");
        assert(Wo > 0, "Wo must be positive");
        //assert(Ai > 0, "Ai must be positive");
        //assert(Ai < Bi, "Ai must be less than Bi" );
        assert(fee => 0, "fee must be nonnegative");
        assert(fee < 1, "fee must be less than one");
        return berr.ERR_NONE;
    },
    poolCheck: function(Bi, Wi, Bo, Wo, fee) {
        if( Bi < bconst.MIN_TOKEN_BALANCE ) return berr.ERR_MIN_BALANCE;
        if( Wi < bconst.MIN_TOKEN_WEIGHT  ) return berr.ERR_MIN_WEIGHT;
        if( Bo < bconst.MIN_TOKEN_BALANCE ) return berr.ERR_MIN_BALANCE;
        if( Wo < bconst.MIN_TOKEN_WEIGHT  ) return berr.ERR_MIN_WEIGHT;

        if( Bi  > bconst.MAX_TOKEN_BALANCE ) return berr.ERR_MAX_BALANCE;
        if( Wi  > bconst.MAX_TOKEN_WEIGHT  ) return berr.ERR_MAX_WEIGHT;
        if( Bo  > bconst.MAX_TOKEN_BALANCE ) return berr.ERR_MAX_BALANCE;
        if( Wo  > bconst.MAX_TOKEN_WEIGHT  ) return berr.ERR_MAX_WEIGHT;
        if( fee > bconst.MAX_FEE  )          return berr.ERR_MAX_FEE;
        return berr.ERR_NONE;
 
    },



    pool_getSpotPrice: function(Bi, Wi, Bo, Wo) {
        let err = this.poolCheck(Bi, Wi, Bo, Wo, 0);
        if( err != berr.ERR_NONE ) return err;
        return module.exports.floatMath.calc_SpotPrice(...arguments);
    },

    calc_SpotPrice: function(Bi, Wi, Bo, Wo) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, 0);
        if (err != berr.ERR_NONE) return err;
 
        var numer = Bo/Wo;
        var denom = Bi/Wi;
        return numer/denom;
    },

    pool_viewSwap_ExactInAnyOut: function (Bi, Wi, Ai, Bo, Wo, fee) {
        let err = this.poolCheck(Bi, Wi, Bo, Wo, fee);
        if( err != berr.ERR_NONE ) return err;
        assert(Ai > 0, "Ai must be positive");

 
        if( Ai > bconst.MAX_TRADE_FRAC * Bi ) return berr.ERR_MAX_TRADE;


 
        let Ao = module.exports.floatMath.calc_OutGivenInApprox(...arguments);
        if( Ao > bconst.MAX_TRADE_FRAC * Bo ) return berr.ERR_MAX_TRADE;
        return Ao;

    },
    calc_OutGivenInExact: function (Bi, Wi, Ai, Bo, Wo, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;
        assert(Ai > 0, "Ai must be positive");
        assert(Ai < Bi, "Ai must be less than Bi" );

        let exponent = (Wi / Wo);
        let adjustedIn = Ai * (1-fee);
        let foo = Bi / (Bi + adjustedIn);
        let bar = foo**exponent;
        let Ao  = Bo * (1 - bar)        

        return Ao;
    },

    calc_OutGivenIn: function() {
        return module.exports.floatMath.calc_OutGivenInApprox(...arguments);
    },
    calc_OutGivenInApprox: function(Bi, Wi, Ai, Bo, Wo, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;
        assert(Ai > 0, "Ai must be positive");
        assert(Ai < Bi, "Ai must be less than Bi" );
 
        let exponent = (Wi / Wo);
        let adjustedIn = Ai * (1-fee);
        let foo = Bi / (Bi + adjustedIn);
        let bar = this.powApprox(foo, exponent);
        let Ao  = Bo * (1 - bar);
        
        return Ao;
    },
   
    pool_viewSwap_AnyInExactOut: function (Bi, Wi, Bo, Wo, Ao, fee) {
        let err = this.poolCheck(Bi, Wi, Bo, Wo, fee);
        if( err != berr.ERR_NONE ) return err;
        if( Ao > bconst.MAX_TRADE_FRAC * Bo ) return berr.ERR_MAX_TRADE;

        let Ai = calc_InGivenOutApprox(Bi, Wi, Bo, Wo, Ao, fee);

        if( Ai > bconst.MAX_TRADE_FRAC * Bi ) return berr.ERR_MAX_TRADE;
        return Ai;
    },
    calc_InGivenOutExact: function (Bi, Wi, Bo, Wo, Ao, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;
        assert(Ao > 0, "Ao must be positive");
        assert(Ao < Bo, "Ao must be less than Bo" );

        let exponent = (Wo / Wi);
        let foo = Bo / (Bo - Ao);
        let bar = foo**exponent;
        let Ai  = Bi * (bar - 1) / (1 - fee);

        return Ai;
    },

    calc_InGivenOut: function() {
        return module.exports.floatMath.calc_InGivenOutApprox(...arguments);
    },
    calc_InGivenOutApprox: function(Bi, Wi, Bo, Wo, Ao, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;
        assert(Ao > 0, "Ao must be positive");
        assert(Ao < Bo, "Ao must be less than Bo" );

        if( Ao > bconst.MAX_TRADE_FRAC * Bo ) return berr.ERR_MAX_TRADE;

        var exponent = (Wo / Wi);
        var foo = Bo / (Bo - Ao);
        var bar = this.powApprox(foo, exponent);

        if( Ai > bconst.MAX_TRADE_FRAC * Bi ) return berr.ERR_MAX_TRADE;
        
        return Bi * (bar - 1) / (1 - fee);

    },

    calc_InGivenPrice: function() {
        return module.exports.floatMath.amountUpToPrice(...arguments);
    },


    amountUpToPriceExact: function(Bi, Wi, Bo, Wo, SER1, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;

        var SER0 = this.spotPrice(Bi, Wi, Bo, Wo);
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;
        let Ai = (foo ** exponent - 1) * Bi / (1 - fee);

        if( Ai > bconst.MAX_TRADE_FRAC * Bi ) return berr.ERR_MAX_TRADE;

        return Ai;
    },

    amountUpToPrice: function() {
        return module.exports.floatMath.amountUpToPriceApprox(...arguments);
    },
    amountUpToPriceApprox: function(Bi, Wi, Bo, Wo, SER1, fee) {
        let err = this.mathCheck(Bi, Wi, Bo, Wo, fee);
        if (err != berr.ERR_NONE) return err;

        var SER0 = this.spotPrice(Bi, Wi, Bo, Wo);
        var exponent = Wo/(Wo + Wi);
        var foo = SER0/SER1;
        var Ai  = (this.powApprox(foo, exponent) - 1) * Bi;
        Ai      = Ai / (1 - fee);

        if( Ai > bconst.MAX_TRADE_FRAC * Bi ) return berr.ERR_MAX_TRADE;

        return Ai;
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
