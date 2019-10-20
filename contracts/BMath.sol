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

pragma solidity ^0.5.11;

import "contracts/BColor.sol";
import "contracts/BConst.sol";
import "contracts/BNum.sol";

contract BMath is BBronze, BConst, BNum
{
    // P = ((Bi/Wi)/(Bo/Wo)) * (1/(1-f))
    function _calc_SpotPrice( uint Bi, uint Wi, uint Bo, uint Wo, uint f) 
      internal pure
        returns ( uint P )
    {
        uint numer = bdiv(Bi, Wi);
        uint denom = bdiv(Bo, Wo);
        uint ratio = bdiv(numer, denom);
        uint scale = bdiv(BONE, bsub(BONE, f));
        return  (P = bmul(ratio, scale));
    }

    // Ao = Bo * (1 - (Bi/(Bi + Ai * (1 - fee)))^(Wi/Wo))
    function _calc_OutGivenIn
      ( uint Bi, uint Wi
      , uint Bo, uint Wo
      , uint Ai
      , uint fee
      )
        pure
        internal
        returns ( uint Ao )
    {
        uint wRatio     = bdiv(Wi, Wo);
        uint adjustedIn = bsub(BONE, fee);
             adjustedIn = bmul(Ai, adjustedIn);
        uint y          = bdiv(Bi, badd(Bi, adjustedIn));
        uint foo        = bpow(y, wRatio);
        uint bar        = bsub(BONE, foo);
             Ao         = bmul(Bo, bar);
        return Ao;
	}

    // Ai = Bi * ((Bo/(Bo - Ao))^(Wo/Wi) - 1) / (1 - fee)
    function _calc_InGivenOut( uint Bi, uint Wi
                             , uint Bo, uint Wo
                             , uint Ao
                             , uint fee
                             )
      internal pure
        returns ( uint Ai )
    {
        uint wRatio = bdiv(Wo, Wi);
        uint diff   = bsub(Bo, Ao);
        uint y      = bdiv(Bo, diff);
        uint foo    = bpow(y, wRatio);
             foo    = bsub(foo, BONE);
             Ai     = bsub(BONE, fee);
             Ai     = bdiv(bmul(Bi, foo), Ai);
        return Ai;
    }

    function _calc_InGivenPrice( uint Bi, uint Wi
                               , uint Bo , uint Wo
                               , uint SP1
                               , uint fee)
      internal pure
        returns ( uint Ai )
    {
        uint SP0    = _calc_SpotPrice(Bi, Wi, Bo, Wo, 0);
        uint base    = bdiv(SP1, SP0);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        Ai           = bsub(bpow(base, exp), BONE);
        Ai           = bmul(Ai, Bi);
        uint foo     = bsub(BONE, fee);
        Ai           = bdiv(Ai, foo);
        return Ai;
    }

    // Pissued = Ptotal * ((1+(tAi/B))^W - 1)
    function _calc_PoolOutGivenSingleIn( uint balance, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint tAi, uint fee )
      internal pure
        returns (uint poolOut)
    {

        //=== REDO this block ===

        // Charge the trading fee for the proportion of tokenAi
        ///  which is implicitly traded to the other pool tokens.
        // That proportion is (1-T.normalizedWeight)
        // tokenAiAfterFee = tAi - tAi * (1-T.normalizedWeight) * poolFee;

        uint normalizedWeight = bdiv(weight, totalWeight);

        uint boo = bsub(BONE, normalizedWeight);
        uint bar = bmul(tAi, bmul(boo, fee));
        uint baz = bsub(tAi, bar);
        uint tokenAiAfterFee = baz;

        uint newBalTi = badd(balance, tokenAiAfterFee);
        uint ratioTi = bdiv(newBalTi, balance);

        // uint newPoolTotal = (ratioTi ^ T.normalizedWeight) * oldPoolTotal;
        uint zoo = bpow(ratioTi, normalizedWeight);
        uint zar = bmul(zoo, poolSupply);
        return (poolOut = bsub(zar, poolSupply));

        //=== ===
    }

    function _calc_SingleInGivenPoolOut( uint balance, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint pAo, uint fee)
      internal pure
        returns (uint tokenIn)
    {

        //=== REDO this block ===

        uint normalizedWeight = bdiv(weight, totalWeight);
        uint newPoolTotal = badd(poolSupply, pAo);
        uint poolRatio = bdiv(newPoolTotal, poolSupply);
      
        //uint newBalTi = poolRatio^(1/T.weight) * T.balance;
        uint boo = bdiv(BONE, normalizedWeight); 
        uint bar = bpow(poolRatio, boo);
        uint newBalTi = bmul(bar, balance);
        uint tokenAi = bsub(newBalTi, balance);
        // Do reverse order of fees charged in joinswap_ExternAmountIn, this way 
        //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
        //uint tokenAiBeforeFee = tokenAi / (1 - (1-T.weight) * _swapFee) ;
        uint zoo = bsub(BONE, normalizedWeight);
        uint zar = bmul(zoo, fee);
        uint zaz = bsub(BONE, zar);
        uint tAi = bdiv(tokenAi, zaz);
        return tAi;

        //=== ===
    }

    // Temporary hack to avoid stack depth
    // TODO actually fix it
    function _calc_SOGPI_helper(uint normalizedWeight, uint pAi, uint fee)
      internal pure
        returns (uint pAi_fee)
    {
        // pAi_fee = poolAi - poolAi * (1-weightTo) * poolFee
        uint boo = BONE - normalizedWeight;
        uint bar = bmul(pAi, boo);
        uint baz = bmul(bar, fee);
        pAi_fee = pAi - baz;
    }

    function _calc_SingleOutGivenPoolIn( uint balance, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint pAi, uint fee, uint exitFee)
      internal pure
        returns (uint tAo)
    {

        // === REDO this block ===

        uint normalizedWeight = bdiv(weight, totalWeight);
        uint pAi_fee = _calc_SOGPI_helper(normalizedWeight, pAi, fee);

        uint newPoolTotal = poolSupply - pAi_fee;
//        uint poolRatio = bdiv(newPoolTotal, poolSupply);
     
        // newBalTo = poolRatio^(1/weightTo) * oldBalTo;
        uint zoo = bdiv(BONE, normalizedWeight); 
        uint zar = bpow(bdiv(newPoolTotal, poolSupply), zoo);
        uint newBalTo = bmul(zar, balance);

        tAo = balance - newBalTo;
        return tAo;

        //=== ===
    }

    function _calc_PoolInGivenSingleOut( uint balance, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint tAo, uint swapFee, uint exitFee)
      internal pure
        returns (uint pAi_beforeFees)
    {

        // === REDO this block ===
        uint normalizedWeight = bdiv(weight, totalWeight);
        uint newBalTo = bsub(balance,tAo);
        uint ratioTo = bdiv(newBalTo, balance);

        //uint newPoolTotal = (ratioTo ^ weightTo) * _totalSupply;
        uint boo = bpow(ratioTo, normalizedWeight);
        uint newPoolTotal = bmul(boo, poolSupply);
        uint poolAi = bsub(poolSupply,newPoolTotal);

        //uint poolAiBeforeTradingFee = poolAo / (1 - (1-weightTo) * poolTradingFee) ;
        uint zoo = bsub(BONE, normalizedWeight);
        uint zar = bmul(zoo, swapFee); 
        uint poolAiBeforeTradingFee = bdiv(poolAi, bsub(BONE, zar));

        uint pAi_beforeFees = bdiv(poolAiBeforeTradingFee, bsub(BONE, exitFee));
        return pAi_beforeFees;

        //=== ===
    }


}
