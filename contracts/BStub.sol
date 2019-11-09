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
import "./BMath.sol";

// BStub exposes BMath internal functions

contract BStub is BBronze, BMath
{
    function calc_SpotPrice( uint Bi, uint Wi, uint Bo, uint Wo, uint f )
      public pure
        returns ( uint price ) 
    {
        return (price = _calc_SpotPrice(Bi, Wi, Bo, Wo, f));
    }

    function calc_OutGivenIn( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ai
                            , uint fee
                            )
      public pure
        returns ( uint Ao )
    {
        return _calc_OutGivenIn(Bi, Wi, Bo, Wo, Ai, fee);
    }

    function calc_InGivenOut( uint Bi, uint Wi
                            , uint Bo, uint Wo
                            , uint Ao
                            , uint fee
                            )
      public pure
        returns ( uint Ai )
    {
        return _calc_InGivenOut(Bi, Wi, Bo, Wo, Ao, fee);
    }

    function calc_InGivenPriceSansFee( uint Bi, uint Wi
                              , uint Bo , uint Wo
                              , uint SER1
                              )
      public pure
        returns ( uint Ai )
    {
        return _calc_InGivenPriceSansFee(Bi, Wi, Bo, Wo, SER1);
    }

    function calc_ExtraAi(uint Ai, uint Bi
                               , uint Wi
                               , uint Wo
                               , uint SP1
                               , uint MarP
                               , uint swapFee)
      public pure
        returns ( uint ExtraAi )
    {
        return _calc_ExtraAi(Ai, Bi, Wi, Wo, SP1, MarP, swapFee);
    }

    function calc_PoolOutGivenSingleIn( uint balance, uint weight
                                      , uint poolBalance, uint totalWeight
                                      , uint tAi, uint swapFee )
      public pure
        returns (uint pAo)
    {
        return  _calc_PoolOutGivenSingleIn( balance, weight, poolBalance, totalWeight , tAi, swapFee);
    }

    function calc_SingleInGivenPoolOut( uint balance, uint weight
                                      , uint poolSupply, uint totalWeight
                                      , uint pAo, uint swapFee)
      public pure
        returns (uint tokenIn)
    {
        return _calc_SingleInGivenPoolOut( balance, weight, poolSupply, totalWeight, pAo, swapFee);
    }

    function calc_SingleOutGivenPoolIn( uint balance, uint weight
                                       , uint poolSupply, uint totalWeight
                                       , uint pAi, uint swapFee)
      public pure
        returns (uint tAo)
    {
        return _calc_SingleOutGivenPoolIn( balance, weight, poolSupply, totalWeight, pAi, swapFee);
    }

    function calc_PoolInGivenSingleOut( uint balance, uint weight
                                      , uint poolSupply, uint totalWeight
                                      , uint tAo, uint swapFee)
      public pure
        returns (uint pAi)
    {
        return calc_PoolInGivenSingleOut( balance, weight, poolSupply, totalWeight, tAo, swapFee);
    }


    function calc_bpow(uint base, uint exp)
      public pure
        returns (uint)
    {
        return bpow(base, exp);
    }

    function calc_bpowApprox(uint base, uint exp, uint precision)
      public pure
        returns (uint)
    {
        return bpowApprox(base, exp, precision);
    }

}