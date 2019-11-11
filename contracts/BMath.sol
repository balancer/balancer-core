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
    /**********************************************************************************************
    // _calc_SpotPrice                                                                           //
    // sP = spotPrice                                                                            //
    // bI = tokenBalanceIn                ( bI / wI )         1                                  //
    // bO = tokenBalanceOut         sP =  -----------  *  ----------                             //
    // wI = tokenWeightIn                 ( bO / wO )     ( 1 - sF )                             //
    // wO = tokenWeightOut                                                                       //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
    function _calc_SpotPrice(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint swapFee
    )
        internal pure
        returns ( uint spotPrice )
    {
        uint numer = bdiv(tokenBalanceIn, tokenWeightIn);
        uint denom = bdiv(tokenBalanceOut, tokenWeightOut);
        uint ratio = bdiv(numer, denom);
        uint scale = bdiv(BONE, bsub(BONE, swapFee));
        return  (spotPrice = bmul(ratio, scale));
    }

    /**********************************************************************************************
    // _calc_OutGivenIn                                                                          //
    // aO = tokenAmountOut                                                                       //
    // bO = tokenBalanceOut                                                                      //
    // bI = tokenBalanceIn              /      /            bI             \    (wI / wO) \      //
    // aI = tokenAmountIn    aO = bO * |  1 - | --------------------------  | ^            |     //
    // wI = tokenWeightIn               \      \ ( bI + ( aI * ( 1 - sF )) /              /      //
    // wO = tokenWeightOut                                                                       //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
    function _calc_OutGivenIn(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint tokenAmountIn,
        uint swapFee
    )
        internal pure
        returns ( uint tokenAmountOut )
    {
        uint weightRatio    = bdiv(tokenWeightIn, tokenWeightOut);
        uint adjustedIn     = bsub(BONE, swapFee);
             adjustedIn     = bmul(tokenAmountIn, adjustedIn);
        uint y              = bdiv(tokenBalanceIn, badd(tokenBalanceIn, adjustedIn));
        uint foo            = bpow(y, weightRatio);
        uint bar            = bsub(BONE, foo);
             tokenAmountOut = bmul(tokenBalanceOut, bar);
        return tokenAmountOut;
	}

    /**********************************************************************************************
    // _calc_InGivenOut                                                                          //
    // aI = tokenAmountIn                                                                        //
    // bO = tokenBalanceOut               /  /     bO      \    (wO / wI)      \                 //
    // bI = tokenBalanceIn          bI * |  | ------------  | ^            - 1  |                //
    // aO = tokenAmountOut    aI =        \  \ ( bO - aO ) /                   /                 //
    // wI = tokenWeightIn           --------------------------------------------                 //
    // wO = tokenWeightOut                          ( 1 - sF )                                   //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
    function _calc_InGivenOut(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint tokenAmountOut,
        uint swapFee
    )
        internal pure
        returns ( uint tokenAmountIn )
    {
        uint weightRatio   = bdiv(tokenWeightOut, tokenWeightIn);
        uint diff          = bsub(tokenBalanceOut, tokenAmountOut);
        uint y             = bdiv(tokenBalanceOut, diff);
        uint foo           = bpow(y, weightRatio);
             foo           = bsub(foo, BONE);
             tokenAmountIn = bsub(BONE, swapFee);
             tokenAmountIn = bdiv(bmul(tokenBalanceIn, foo), tokenAmountIn);
        return tokenAmountIn;
    }

    /**********************************************************************************************
    // _calc_InGivenPriceNoFee                                                                   //
    // aI  = tokenAmountIn                                                                       //
    // bI = tokenBalanceIn                    //   SP1    \     /   wO    \        \             //
    // SP0 = spotPriceBefore       aI = bI * || ---------  | ^ | --------  |   - 1  |            //
    // SP1 = spotPriceAfter                   \\   SP0    /     \ wO + wI /        /             //
    // wI = tokenWeightIn                                                                        //
    // wO = tokenWeightOut                                                                       //
    **********************************************************************************************/
    function _calc_InGivenPriceNoFee(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint spotPriceAfter
    )
        internal pure
        returns ( uint tokenAmountIn )
    {
        uint spotPriceBefore = _calc_SpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, 0);
        uint base            = bdiv(spotPriceAfter, spotPriceBefore);
        uint exp             = bdiv(tokenWeightOut, badd(tokenWeightOut, tokenWeightIn));
        uint foo             = bsub(bpow(base, exp), BONE);
        tokenAmountIn        = bmul(foo, tokenBalanceIn);
        return tokenAmountIn;
    }

    /**********************************************************************************************
    // _calc_extraAmountIn                                                                       //
    // eAi = extraAmountIn               //                \      \                              //
    // aI = tokenAmountIn               || ( 1 - sF) * aI ) | + bI | * ( mP - SP1 )              //
    // mP = marginalPrice                \\                /      /                              //
    // bI = tokenBalanceIn      eAi =  -----------------------------------------------           //
    // wI = tokenWeightIn               /            /    wI \     (sF * bI) \                   //
    // wO = tokenWeightOut             | (1 - sF) * | 1 + --  | +  ---------  | * SP1            //
    // SP1 = spotPriceAfter             \            \    wO /     (aI + bI) /                   //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
    function _calc_ExtraAmountIn(
        uint tokenAmountIn,
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenWeightOut,
        uint spotPriceAfter,
        uint marginalPrice,
        uint swapFee
    )
        internal pure
        returns ( uint extraAmountIn )
    {
        uint adjustedIn = bsub(BONE, swapFee);
             adjustedIn = bmul(adjustedIn, tokenAmountIn);
        uint numer = badd(adjustedIn, tokenBalanceIn);
             numer = bmul(numer, bsub(marginalPrice, spotPriceAfter));
        uint ratio = bdiv(tokenWeightIn, tokenWeightOut);
        uint bar = bmul(bsub(BONE, swapFee), badd(BONE, ratio));
        uint zaz = bdiv(bmul(swapFee, tokenBalanceIn), badd(tokenAmountIn, tokenBalanceIn));
        uint denom = bmul(spotPriceAfter, badd(bar, zaz));
        extraAmountIn = bdiv(numer, denom);
        return extraAmountIn;
    }

    /**********************************************************************************************
    // _calc_InGivenPrice                                                                        //
    // _calc_InGivenPriceNoFee + extraAmountIn                                                   //
    **********************************************************************************************/
    function _calc_InGivenPrice(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint totalWeight,
        uint spotPriceAfter,
        uint swapFee
    )
        internal pure
        returns ( uint tokenAmountIn )
    {
        // Calculate what Ai and Ao to get price to SP1 if there were no fees:
        uint spotPriceAfterNoFee = bmul(spotPriceAfter, bsub(BONE, swapFee));
        uint amountInNoFee = _calc_InGivenPriceNoFee(tokenBalanceIn, tokenWeightIn, tokenBalanceOut,
                                tokenWeightOut, spotPriceAfterNoFee);
        uint amountOutNoFee = _calc_OutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut,
                                tokenWeightOut, amountInNoFee, swapFee);
        
        // Calculate what new spot price would be with Ai and Ao as calculated above
        uint spotPriceNoFee = _calc_SpotPrice(badd(tokenBalanceIn, amountInNoFee), tokenWeightIn, bsub(tokenBalanceOut, amountOutNoFee), tokenWeightOut, swapFee);

        uint extraAmountIn;

        // SPNF is always less or equal (in case of no fees) to SP1. When it's equal
        // then rounding errors in SPNF may make it slightly (a few wei) greater than SP1
        // In this case SPNF is considered to be SP1 and no extraAi is needed.

        spotPriceNoFee > spotPriceAfter ? extraAmountIn = 0 : extraAmountIn = _calc_ExtraAmountIn(amountInNoFee, tokenBalanceIn, bdiv(tokenWeightIn, totalWeight), bdiv(tokenWeightOut, totalWeight), spotPriceNoFee, spotPriceAfter, swapFee);
                
        // Update Ai by adding the extraAi and also Ao
        tokenAmountIn = badd(amountInNoFee, extraAmountIn);
            
        return tokenAmountIn;
    }

    /**********************************************************************************************
    // _calc_PoolOutGivenSingleIn                                                                //
    // pAo = poolAmountOut         /                                              \              //
    // tAi = tokenAmountIn        ///      /     //    wI \      \\       \     wI \             //
    // wI = tokenWeightIn        //| tAi *| 1 - || 1 - --  | * sF || + tBi \    --  \            //
    // tW = totalWeight     pAo=||  \      \     \\    tW /      //         | ^ tW   | * pS - pS //
    // tBi = tokenBalanceIn      \\  ------------------------------------- /        /            //
    // pS = poolSupply            \\                    tBi               /        /             //
    // sF = swapFee                \                                              /              //
    **********************************************************************************************/
    function _calc_PoolOutGivenSingleIn(
        uint tokenBalanceIn,
        uint tokenWeightIn,
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
        uint normalizedWeight = bdiv(tokenWeightIn, totalWeight);
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        uint tokenAmountInAfterFee = bmul(tokenAmountIn, bsub(BONE, zaz));

        uint newTokenBalanceIn = badd(tokenBalanceIn, tokenAmountInAfterFee);
        uint tokenInRatio = bdiv(newTokenBalanceIn, tokenBalanceIn);

        // uint newPoolSupply = (ratioTi ^ weightTi) * poolSupply;
        uint poolRatio = bpow(tokenInRatio, normalizedWeight);
        uint newPoolSupply = bmul(poolRatio, poolSupply);
        poolAmountOut = bsub(newPoolSupply, poolSupply);
        return poolAmountOut;
    }

    /**********************************************************************************************
    // _calc_SingleInGivenPoolOut                                                                //
    // tAi = tokenAmountIn              //(pS + pAo)\     /    1    \\                           //
    // pS = poolSupply                 || ---------  | ^ | --------- || * bI - bI                //
    // pAo = poolAmountOut              \\    pS    /     \(wI / tW)//                           //
    // bI = balanceIn          tAi =  --------------------------------------------               //
    // wI = weightIn                              /      wI  \                                   //
    // tW = totalWeight                          |  1 - ----  |  * sF                            //
    // sF = swapFee                               \      tW  /                                   //
    **********************************************************************************************/
    function _calc_SingleInGivenPoolOut(
        uint tokenBalanceIn,
        uint tokenWeightIn,
        uint poolSupply,
        uint totalWeight,
        uint poolAmountOut,
        uint swapFee
    )
        internal pure
        returns (uint tokenAmountIn)
    {
        uint normalizedWeight = bdiv(tokenWeightIn, totalWeight);
        uint newPoolSupply = badd(poolSupply, poolAmountOut);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
      
        //uint newBalTi = poolRatio^(1/weightTi) * balTi;
        uint boo = bdiv(BONE, normalizedWeight); 
        uint tokenInRatio = bpow(poolRatio, boo);
        uint newTokenBalanceIn = bmul(tokenInRatio, tokenBalanceIn);
        uint tokenAmountInAfterFee = bsub(newTokenBalanceIn, tokenBalanceIn);
        // Do reverse order of fees charged in joinswap_ExternAmountIn, this way 
        //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
        //uint tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
        uint zar = bmul(bsub(BONE, normalizedWeight), swapFee);
        tokenAmountIn = bdiv(tokenAmountInAfterFee, bsub(BONE, zar));
        return tokenAmountIn;
    }

    /**********************************************************************************************
    // _calc_SingleOutGivenPoolIn                                                                //
    // tAo = tokenAmountOut            /      /                                             \\   //
    // bO = tokenBalanceOut           /      // pS - (pAi * (1 - eF)) \     /    1    \      \\  //
    // pAi = poolAmountIn            | bO - || ----------------------- | ^ | --------- | * b0 || // 
    // ps = poolSupply                \      \\          pS           /     \(wO / tW)/      //  //
    // wI = tokenWeightIn      tAo =   \      \                                             //   //                                              
    // tW = totalWeight                    /     /      wO \       \                             //
    // sF = swapFee                    *  | 1 - |  1 - ---- | * sF  |                            //          
    // eF = exitFee                        \     \      tW /       /                             //
    **********************************************************************************************/
    function _calc_SingleOutGivenPoolIn(
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint poolSupply,
        uint totalWeight,
        uint poolAmountIn,
        uint swapFee
    )
        internal pure
        returns (uint tokenAmountOut)
    {
        uint normalizedWeight = bdiv(tokenWeightOut, totalWeight);
        // charge exit fee on the pool token side
        // pAiAfterExitFee = pAi*(1-exitFee)
        uint poolAmountInAfterExitFee = bmul(poolAmountIn, bsub(BONE, EXIT_FEE));
        uint newPoolSupply = bsub(poolSupply,poolAmountInAfterExitFee);
        uint poolRatio = bdiv(newPoolSupply, poolSupply);
     
        // newBalTo = poolRatio^(1/weightTo) * balTo;
        uint tokenOutRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
        uint newTokenBalanceOut = bmul(tokenOutRatio, tokenBalanceOut);

        uint tokenAmountOutBeforeSwapFee = bsub(tokenBalanceOut,newTokenBalanceOut);

        // charge swap fee on the output token side 
        //uint tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
        uint zaz = bmul(bsub(BONE, normalizedWeight), swapFee); 
        tokenAmountOut = bmul(tokenAmountOutBeforeSwapFee, bsub(BONE, zaz));
        return tokenAmountOut;
    }

    /**********************************************************************************************
    // _calc_PoolInGivenSingleOut                                                                //
    // pAi = poolAmountIn               // /               tAo             \\     / wO \     \   //                \\   //
    // bO = tokenBalanceOut            // | bO - -------------------------- |\   | ---- |     \  //
    // tAo = tokenAmountOut      pS - ||   \     1 - ((1 - (tO / tW)) * sF)/  | ^ \ tW /  * pS | //
    // ps = poolSupply                 \\ -----------------------------------/                /  //
    // wO = tokenWeightOut  pAi =       \\               bO                 /                /   //
    // tW = totalWeight           -------------------------------------------------------------  //    
    // sF = swapFee                                        ( 1 - eF )                            //
    // eF = exitFee                                                                              //
    **********************************************************************************************/
    function _calc_PoolInGivenSingleOut(
        uint tokenBalanceOut,
        uint tokenWeightOut,
        uint poolSupply,
        uint totalWeight,
        uint tokenAmountOut,
        uint swapFee
    )
        internal pure
        returns (uint poolAmountIn)
    {

        // charge swap fee on the output token side 
        uint normalizedWeight = bdiv(tokenWeightOut, totalWeight);
        //uint tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
        uint zoo = bsub(BONE, normalizedWeight);
        uint zar = bmul(zoo, swapFee); 
        uint tokenAmountOutBeforeSwapFee = bdiv(tokenAmountOut, bsub(BONE, zar));

        uint newTokenBalanceOut = bsub(tokenBalanceOut,tokenAmountOutBeforeSwapFee);
        uint tokenOutRatio = bdiv(newTokenBalanceOut, tokenBalanceOut);

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
