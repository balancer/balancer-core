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
    /*************************************************************************************
    // _calc_SpotPrice                                                                  //
    // sP = spotPrice                                                                   //
    // bI = balanceIn                ( bI / wI )         1                              //
    // bO = balanceOut         sP =  -----------  *  ----------                         //
    // wI = weightIn                 ( bO / wO )     ( 1 - sF )                         //
    // wO = weightOut                                                                   //
    // sF = swapFee                                                                     //
    *************************************************************************************/
    function _calc_SpotPrice(
        uint balanceIn,
        uint weightIn,
        uint balanceOut,
        uint weightOut,
        uint swapFee
    )
        internal pure
        returns ( uint spotPrice )
    {
        uint numer = bdiv(balanceIn, weightIn);
        uint denom = bdiv(balanceOut, weightOut);
        uint ratio = bdiv(numer, denom);
        uint scale = bdiv(BONE, bsub(BONE, swapFee));
        return  (spotPrice = bmul(ratio, scale));
    }

    /*************************************************************************************
    // _calc_OutGivenIn                                                                 //
    // aO = amountOut                                                                   //
    // bO = balanceOut                                                                  //
    // bI = balanceIn              /      /            bI             \    (wI / wO) \  //
    // aI = amountIn    aO = bO * |  1 - | --------------------------  | ^            | //
    // wI = weightIn               \      \ ( bI + ( aI * ( 1 - sF )) /              /  //
    // wO = weightOut                                                                   //
    // sF = swapFee                                                                     //
    *************************************************************************************/
    function _calc_OutGivenIn(
        uint balanceIn,
        uint weightIn,
        uint balanceOut,
        uint weightOut,
        uint amountIn,
        uint swapFee
    )
        internal pure
        returns ( uint amountOut )
    {
        uint weightRatio = bdiv(weightIn, weightOut);
        uint adjustedIn  = bsub(BONE, swapFee);
             adjustedIn  = bmul(amountIn, adjustedIn);
        uint y           = bdiv(balanceIn, badd(balanceIn, adjustedIn));
        uint foo         = bpow(y, weightRatio);
        uint bar         = bsub(BONE, foo);
             amountOut   = bmul(balanceOut, bar);
        return amountOut;
	}

    /*************************************************************************************
    // _calc_InGivenOut                                                                 //
    // aI = amountIn                                                                    //
    // bO = balanceOut               /  /     bO      \    (wO / wI)      \             //
    // bI = balanceIn          bI * |  | ------------  | ^            - 1  |            //
    // aO = amountOut    aI =        \  \ ( bO - aO ) /                   /             //
    // wI = weightIn           --------------------------------------------             //
    // wO = weightOut                          ( 1 - sF )                               //
    // sF = swapFee                                                                     //
    *************************************************************************************/
    function _calc_InGivenOut(
        uint balanceIn,
        uint weightIn,
        uint balanceOut,
        uint weightOut,
        uint amountOut,
        uint swapFee
    )
        internal pure
        returns ( uint amountIn )
    {
        uint weightRatio = bdiv(weightOut, weightIn);
        uint diff        = bsub(balanceOut, amountOut);
        uint y           = bdiv(balanceOut, diff);
        uint foo         = bpow(y, weightRatio);
             foo         = bsub(foo, BONE);
             amountIn    = bsub(BONE, swapFee);
             amountIn    = bdiv(bmul(balanceIn, foo), amountIn);
        return amountIn;
    }

    /*************************************************************************************
    // _calc_InGivenPrice                                                               //
    // aI  = amountIn                                                                   //
    // bI = balanceIn                       /  /   SP0    \     /   wO    \        \    //
    // SP0 = spotPriceBefore          bI * |  | ---------  | ^ | --------  |   - 1  |   //
    // SP1 = spotPriceAfter    aI =         \  \   SP1    /     \ wO + wI /        /    //
    // wI = weightIn                 ----------------------------------------------     //
    // wO = weightOut                                  ( 1 - sF )                       //
    // sF = swapFee                                                                     //
    *************************************************************************************/
    function _calc_InGivenPrice(
        uint balanceIn,
        uint weightIn,
        uint balanceOut,
        uint weightOut,
        uint spotPriceAfter,
        uint swapFee
    )
        internal pure
        returns ( uint amountIn )
    {
        uint spotPriceBefore = _calc_SpotPrice(balanceIn, weightIn, balanceOut, weightOut, 0);
        uint base            = bdiv(spotPriceAfter, spotPriceBefore);
        uint exp             = bdiv(weightOut, badd(weightOut, weightIn));
        amountIn             = bsub(bpow(base, exp), BONE);
        amountIn             = bmul(amountIn, balanceIn);
        uint foo     = bsub(BONE, swapFee);
        amountIn           = bdiv(amountIn, foo);
        return amountIn;
    }

    // Pissued = Ptotal * ((1+(tAi/B))^W - 1)
    function _calc_PoolOutGivenSingleIn(
        uint balanceTokenIn,
        uint weightTokenIn,
        uint poolSupply,
        uint totalWeight,
        uint tokenAmountIn,
        uint swapFee
    )
        internal pure
        returns (uint poolAmountOut)
    {
        // Charge the trading fee for the proportion of tokenAi
        ///  which is implicitly traded to the other pool tokens.
        // That proportion is (1- weightTokenIn)
        // tokenAiAfterFee = tAi * (1 - (1-weightTi) * poolFee);
        uint normalizedWeight = bdiv(weightTokenIn, totalWeight);
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        uint tokenAmountInAfterFee = bmul(tokenAmountIn, bsub(BONE, zaz));

        uint newBalanceTokenIn = badd(balanceTokenIn, tokenAmountInAfterFee);
        uint tokenInRatio = bdiv(newBalanceTokenIn, balanceTokenIn);

        // uint newPoolSupply = (ratioTi ^ weightTi) * poolSupply;
        uint poolRatio = bpow(tokenInRatio, normalizedWeight);
        uint newPoolSupply = bmul(poolRatio, poolSupply);
        poolAmountOut = bsub(newPoolSupply, poolSupply);
        return poolAmountOut;
    }

    function _calc_SingleInGivenPoolOut(
        uint balanceTokenIn,
        uint weightTokenIn,
        uint poolSupply,
        uint totalWeight,
        uint poolAmountOut,
        uint swapFee
    )
        internal pure
        returns (uint tokenAmountIn)
    {
        uint normalizedWeight = bdiv(weightTokenIn, totalWeight);
        uint newPoolSupply = badd(poolSupply, poolAmountOut);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
      
        //uint newBalTi = poolRatio^(1/weightTi) * balTi;
        uint boo = bdiv(BONE, normalizedWeight); 
        uint tokenInRatio = bpow(poolRatio, boo);
        uint newBalanceTokenIn = bmul(tokenInRatio, balanceTokenIn);
        uint tokenAmountInAfterFee = bsub(newBalanceTokenIn, balanceTokenIn);
        // Do reverse order of fees charged in joinswap_ExternAmountIn, this way 
        //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
        //uint tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
        uint zar = bmul(bsub(BONE, normalizedWeight), swapFee);
        tokenAmountIn = bdiv(tokenAmountInAfterFee, bsub(BONE, zar));
        return tokenAmountIn;
    }

    function _calc_SingleOutGivenPoolIn(
        uint balanceTokenOut,
        uint weightTokenOut,
        uint poolSupply,
        uint totalWeight,
        uint poolAmountIn,
        uint swapFee
    )
        internal pure
        returns (uint tokenAmountOut)
    {
        uint normalizedWeight = bdiv(weightTokenOut, totalWeight);
        // charge exit fee on the pool token side
        // pAiAfterExitFee = pAi*(1-exitFee)
        uint poolAmountInAfterExitFee = bmul(poolAmountIn, bsub(BONE, EXIT_FEE));
        uint newPoolSupply = bsub(poolSupply,poolAmountInAfterExitFee);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
     
        // newBalTo = poolRatio^(1/weightTo) * balTo;
        uint tokenOutRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
        uint newBalanceTokenOut = bmul(tokenOutRatio, balanceTokenOut);

        uint tokenAmountOutBeforeSwapFee = bsub(balanceTokenOut,newBalanceTokenOut);

        // charge swap fee on the output token side 
        //uint tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        tokenAmountOut = bmul(tokenAmountOutBeforeSwapFee, bsub(BONE, zaz));
        return tokenAmountOut;
    }

    function _calc_PoolInGivenSingleOut(
        uint balanceTokenOut,
        uint weightTokenOut,
        uint poolSupply,
        uint totalWeight,
        uint tokenAmountOut,
        uint swapFee
    )
        internal pure
        returns (uint poolAmountIn)
    {

        // charge swap fee on the output token side 
        uint normalizedWeight = bdiv(weightTokenOut, totalWeight);
        //uint tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
        uint zoo = bsub(BONE, normalizedWeight);
        uint zar = bmul(zoo, swapFee); 
        uint tokenAmountOutBeforeSwapFee = bdiv(tokenAmountOut, bsub(BONE, zar));

        uint newBalanceTokenOut = bsub(balanceTokenOut,tokenAmountOutBeforeSwapFee);
        uint tokenOutRatio = bdiv(newBalanceTokenOut, balanceTokenOut);

        //uint newPoolSupply = (ratioTo ^ weightTo) * poolSupply;
        uint poolRatio = bpow(tokenOutRatio, normalizedWeight);
        uint newPoolSupply = bmul(poolRatio, poolSupply);
        uint poolAmountInAfterExitFee = bsub(poolSupply,newPoolSupply);

        // charge exit fee on the pool token side
        // pAi = pAiAfterExitFee/(1-exitFee)
        poolAmountIn = bdiv(poolAmountInAfterExitFee, bsub(BONE, EXIT_FEE));
        return poolAmountIn;
    }


}
