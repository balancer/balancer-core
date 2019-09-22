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
    // Names
    // Bi := Balance In
    // Bo := Balance Out
    // Wi := Weight In
    // Wo := Weight Out
    // Ai := Amount In
    // Ao := Amount Out

    function _calc_SpotPrice( uint Bi, uint Wi, uint Bo, uint Wo, uint f) 
      public pure
        returns ( uint P )
    {
        uint numer = bdiv(Bi, Wi);
        uint denom = bdiv(Bo, Wo);
        uint ratio = bdiv(numer, denom);
        uint scale = bdiv(BONE, bsub(BONE, f));
        return  (P = bmul(ratio, scale));
    }

    function _calc_SpotRate( uint Bi, uint Wi, uint Bo, uint Wo, uint f)
      public pure
        returns ( uint R ) 
    {
        uint numer = bdiv(Bo, Wo);
        uint denom = bdiv(Bi, Wi);
        uint ratio = bdiv(numer, denom);
        uint scale = bmul(BONE, bsub(BONE, f));
        return  (R = bmul(ratio, scale));
    }

    //  Ao = Bo * (1 - (Bi/(Bi + Ai * (1 - fee)))^(Wi/Wo))
    function _calc_OutGivenIn( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ai
                            , uint fee
                            )
      pure internal
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

    // Ai = ((Bi/(Bi + Ai))^(Wo/Wi) - 1) * Bo / (1 - fee)
    function _calc_InGivenOut( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ao
                            , uint fee
                            )
      public pure
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
                              , uint SER1
                              , uint fee)
      public pure
        returns ( uint Ai )
    {
        uint SER0    = _calc_SpotRate(Bi, Wi, Bo, Wo, 0);
        uint base    = bdiv(SER0, SER1);
        uint exp     = bdiv(Wo, badd(Wo, Wi));
        Ai           = bsub(bpow(base, exp), BONE);
        Ai           = bmul(Ai, Bi);
        uint foo     = bsub(BONE, fee);
        Ai           = bdiv(Ai, foo);
        return Ai;
    }

    function _calc_PoolOutGivenSingleIn( uint balance, uint weight
                               , uint poolBalance, uint totalWeight
                               , uint tAi, uint fee)
      public pure
        returns (uint poolOut)
    {
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
        uint zar = bmul(zoo, poolBalance);
        return (poolOut = bsub(zar, poolBalance));
    }

    function _calc_SingleInGivenPoolOut( uint balance, uint weight
                              , uint poolBalance, uint totalWeight
                              , uint pAo, uint fee)
      public pure
        returns (uint tokenIn)
    {
        uint normalizedWeight = bdiv(weight, totalWeight);
        uint newPoolTotal = badd(poolBalance, pAo);
        uint poolRatio = bdiv(newPoolTotal, poolBalance);
      
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
    }

    function _calc_SOGPI_helper(uint normalizedWeight, uint pAi, uint fee)
      pure internal
        returns (uint pAi_fee)
    {
        // pAi_fee = poolAi - poolAi * (1-weightTo) * poolFee
        uint boo = BONE - normalizedWeight;
        uint bar = bmul(pAi, boo);
        uint baz = bmul(bar, fee);
        pAi_fee = pAi - baz;
    }

    function _calc_SingleOutGivenPoolIn( uint balance, uint weight
                                       , uint poolBalance, uint totalWeight
                                       , uint pAi, uint fee)
      public pure
        returns (uint tAo)
    {
        uint normalizedWeight = bdiv(weight, totalWeight);
        uint pAi_fee = _calc_SOGPI_helper(normalizedWeight, pAi, fee);

        uint newPoolTotal = poolBalance - pAi_fee;
        uint poolRatio = bdiv(newPoolTotal, poolBalance);
     
        // newBalTo = poolRatio^(1/weightTo) * oldBalTo;
        uint zoo = bdiv(BONE, normalizedWeight); 
        uint zar = bpow(poolRatio, zoo);
        uint newBalTo = bmul(zar, balance);

        tAo = balance - newBalTo;
        return tAo;
    }

    function _calc_PoolInGivenSingleOut( uint balance, uint weight
                                       , uint poolBalance, uint totalWeight
                                       , uint tAo, uint swapFee, uint exitFee)
      public pure
        returns (uint poolIn)
    {
        uint newBalTo = balance - tAo;
        uint ratioTo = bdiv(newBalTo, balance);

        //uint newPoolTotal = (ratioTo ^ weightTo) * _totalSupply;
        uint boo = bpow(ratioTo, weight);
        uint bar = bmul(boo, poolBalance);
        uint newPoolTotal = bar;
        uint poolAo = poolBalance - newPoolTotal;

        //uint poolAoBeforeTradingFee = poolAo / (1 - (1-weightTo) * poolTradingFee) ;
        uint zoo = bsub(BONE, weight);
        uint zar = bmul(zoo, swapFee); // poolAoBeforeTradingFees
        uint poolAoBeforeFees = bdiv(zar, bsub(BONE, exitFee));
    }


}
