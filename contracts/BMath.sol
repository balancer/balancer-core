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
    // aI = amountTokenIn                                                                        //
    // bO = balanceTokenOut               /  /     bO      \    (wO / wI)      \                 //
    // bI = balanceTokenIn          bI * |  | ------------  | ^            - 1  |                //
    // aO = amountTokenOut    aI =        \  \ ( bO - aO ) /                   /                 //
    // wI = weightTokenIn           --------------------------------------------                 //
    // wO = weightTokenOut                          ( 1 - sF )                                   //
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
    // _calc_InGivenPrice                                                                        //
    // aI  = amountIn                                                                            //
    // bI = balanceIn                       /  /   SP0    \     /   wO    \        \             //
    // SP0 = spotPriceBefore          bI * |  | ---------  | ^ | --------  |   - 1  |            //
    // SP1 = spotPriceAfter    aI =         \  \   SP1    /     \ wO + wI /        /             //
    // wI = weightIn                 ----------------------------------------------              //
    // wO = weightOut                                  ( 1 - sF )                                //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
    function _calc_InGivenPriceSansFee( uint Bi, uint Wi
                               , uint Bo , uint Wo
                               , uint SP1)
      internal pure
        returns ( uint Ai )
    {
        uint SP0    = _calc_SpotPrice(Bi, Wi, Bo, Wo, 0); // Calculate w/o fee
        uint base    = bdiv(SP1, SP0);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        uint foo     = bsub(bpow(base, exp), BONE);
        Ai           = bmul(foo, Bi);
        return Ai;
    }

    function _calc_InGivenPrice( uint Bi, uint Wi
                               , uint Bo , uint Wo
                               , uint totalWeight, uint SP1, uint swapFee)
      internal pure
        returns ( uint Ai )
    {
        // Calculate what Ai and Ao to get price to SP1 if there were no fees:
        //uint SP1sansFee = bmul(SP1,bsub(BONE,_swapFee));
        uint AiNF = _calc_InGivenPriceSansFee(Bi, Wi, Bo, Wo
                                        , bmul(SP1, bsub(BONE, swapFee)));
        uint AoNF = _calc_OutGivenIn(Bi, Wi, Bo, Wo, AiNF, swapFee);
        
        // Calculate what new spot price would be with Ai and Ao as calculated above
        uint SPNF = _calc_SpotPrice(badd(Bi,AiNF), Wi, bsub(Bo,AoNF), Wo, swapFee);

        uint extraAi;
        uint normWi = bdiv(Wi, totalWeight);
        uint normWo = bdiv(Wo, totalWeight);

        // SPNF is always less or equal (in case of no fees) to SP1. When it's equal
        // then rounding errors in SPNF may make it slightly (a few wei) greater than SP1
        // In this case SPNF is considered to be SP1 and no extraAi is needed.

        SPNF > SP1 ? extraAi = 0 : extraAi = _calc_ExtraAi(AiNF, Bi, normWi, normWo, SPNF, SP1, swapFee);
                
        // Update Ai by adding the extraAi and also Ao
        Ai = badd(AiNF, extraAi);
            
        return Ai;
    }

    function _calc_ExtraAi(uint Ai, uint Bi
                          , uint Wi
                          , uint Wo
                          , uint SP1
                          , uint MarP
                          , uint swapFee)
      internal pure
        returns ( uint extraAi )
    {
        uint adjustedIn = bsub(BONE, swapFee);
             adjustedIn = bmul(adjustedIn, Ai);
        uint numer = badd(adjustedIn, Bi);
             numer = bmul(numer, bsub(MarP, SP1));
        uint ratio = bdiv(Wi, Wo);
        uint bar = bmul(bsub(BONE, swapFee), badd(BONE, ratio));
        uint zaz = bdiv(bmul(swapFee, Bi), badd(Ai, Bi));
        uint denom = bmul(SP1, badd(bar, zaz));
        extraAi = bdiv(numer, denom);
        return extraAi;
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
