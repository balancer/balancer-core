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

import "./BColor.sol";
import "./BConst.sol";
import "./BNum.sol";

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
    function _calc_PoolOutGivenSingleIn( uint balTi, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint tAi, uint swapFee )
      internal pure
        returns (uint pAo)
    {
        // Charge the trading fee for the proportion of tokenAi
        ///  which is implicitly traded to the other pool tokens.
        // That proportion is (1- weightTi)
        // tokenAiAfterFee = tAi * (1 - (1-weightTi) * poolFee);
        uint normalizedWeight = bdiv(weight, totalWeight);
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        uint tAiAfterFee = bmul(tAi, bsub(BONE, zaz));

        uint newBalTi = badd(balTi, tAiAfterFee);
        uint TiRatio = bdiv(newBalTi, balTi);

        // uint newPoolSupply = (ratioTi ^ weightTi) * poolSupply;
        uint poolRatio = bpow(TiRatio, normalizedWeight);
        uint newPoolSupply = bmul(poolRatio, poolSupply);
        pAo = bsub(newPoolSupply, poolSupply);
        return pAo;
    }

    function _calc_SingleInGivenPoolOut( uint balTi, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint pAo, uint swapFee)
      internal pure
        returns (uint tAi)
    {
        uint normalizedWeight = bdiv(weight, totalWeight);
        uint newPoolSupply = badd(poolSupply, pAo);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
      
        //uint newBalTi = poolRatio^(1/weightTi) * balTi;
        uint boo = bdiv(BONE, normalizedWeight); 
        uint TiRatio = bpow(poolRatio, boo);
        uint newBalTi = bmul(TiRatio, balTi);
        uint tAiAfterFee = bsub(newBalTi, balTi);
        // Do reverse order of fees charged in joinswap_ExternAmountIn, this way 
        //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
        //uint tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
        uint zar = bmul(bsub(BONE, normalizedWeight), swapFee);
        tAi = bdiv(tAiAfterFee, bsub(BONE, zar));
        return tAi;
    }

    function _calc_SingleOutGivenPoolIn( uint balTo, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint pAi, uint swapFee, uint exitFee)
      internal pure
        returns (uint tAo)
    {
        uint normalizedWeight = bdiv(weight, totalWeight);
        // charge exit fee on the pool token side
        // pAiAfterExitFee = pAi*(1-exitFee)
        uint pAiAfterExitFee = bmul(pAi, bsub(BONE, exitFee));
        uint newPoolSupply = bsub(poolSupply,pAiAfterExitFee);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
     
        // newBalTo = poolRatio^(1/weightTo) * balTo;
        uint ToRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
        uint newBalTo = bmul(ToRatio, balTo);

        uint tAoBeforeSwapFee = bsub(balTo,newBalTo);

        // charge swap fee on the output token side 
        //uint tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        tAo = bmul(tAoBeforeSwapFee, bsub(BONE, zaz));
        return tAo;
    }

    function _calc_PoolInGivenSingleOut( uint balTo, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint tAo, uint swapFee, uint exitFee)
      internal pure
        returns (uint pAi)
    {

        // charge swap fee on the output token side 
        uint normalizedWeight = bdiv(weight, totalWeight);
        //uint tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
        uint zoo = bsub(BONE, normalizedWeight);
        uint zar = bmul(zoo, swapFee); 
        uint tAoBeforeSwapFee = bdiv(tAo, bsub(BONE, zar));

        uint newBalTo = bsub(balTo,tAoBeforeSwapFee);
        uint ToRatio = bdiv(newBalTo, balTo);

        //uint newPoolSupply = (ratioTo ^ weightTo) * poolSupply;
        uint poolRatio = bpow(ToRatio, normalizedWeight);
        uint newPoolSupply = bmul(poolRatio, poolSupply);
        uint pAiAfterExitFee = bsub(poolSupply,newPoolSupply);

        // charge exit fee on the pool token side
        // pAi = pAiAfterExitFee/(1-exitFee)
        pAi = bdiv(pAiAfterExitFee, bsub(BONE, exitFee));
        return pAi;
    }


}
