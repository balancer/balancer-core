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

pragma solidity 0.5.12;

import "../BMath.sol";
import "../BNum.sol";

// Contract to wrap internal functions for testing

contract TMath is BMath {
    function tCalcSpotPrice(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint swapFee
    )
        external pure
        returns ( uint spotPrice ) 
    {
        return calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee);
    }

    function tCalcOutGivenIn(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint tokenAmountIn,
                uint swapFee
    )
        external pure
        returns ( uint tokenAmountOut )
    {
        return calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee);
    }

    function tCalcInGivenOut(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint tokenAmountOut,
                uint swapFee
            )
        external pure
        returns ( uint tokenAmountIn )
    {
        return calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee);
    }


    function tCalcPoolOutGivenSingleIn(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint poolSupply,
                uint totalWeight,
                uint tokenAmountIn,
                uint swapFee
            )
        external pure
        returns (uint poolAmountOut)
    {
        return  calcPoolOutGivenSingleIn( tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight , tokenAmountIn, swapFee);
    }

    function tCalcSingleInGivenPoolOut(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint poolSupply,
                uint totalWeight,
                uint poolAmountOut,
                uint swapFee
            )
        external pure
        returns (uint tokenAmountIn)
    {
        return calcSingleInGivenPoolOut( tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, poolAmountOut, swapFee);
    }

    function tCalcSingleOutGivenPoolIn(
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint poolSupply,
                uint totalWeight,
                uint poolAmountIn,
                uint swapFee
            )
        external pure
        returns (uint tokenAmountOut)
    {
        return calcSingleOutGivenPoolIn( tokenBalanceOut, tokenWeightOut, poolSupply, totalWeight, poolAmountIn, swapFee);
    }

    function tCalcPoolInGivenSingleOut(
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint poolSupply,
                uint totalWeight,
                uint tokenAmountOut,
                uint swapFee
            )
        external pure
        returns (uint poolAmountIn)
    {
        return calcPoolInGivenSingleOut( tokenBalanceOut, tokenWeightOut, poolSupply, totalWeight, tokenAmountOut, swapFee);
    }

    function calc_btoi(uint a) external pure returns (uint) {
        return btoi(a);
    }

    function calc_bfloor(uint a) external pure returns (uint) {
        return bfloor(a);
    }

    function calc_badd(uint a, uint b) external pure returns (uint) {
        return badd(a, b);
    }

    function calc_bsub(uint a, uint b) external pure returns (uint) {
        return bsub(a, b);
    }

    function calc_bsubSign(uint a, uint b) external pure returns (uint, bool) {
        return bsubSign(a, b);
    }

    function calc_bmul(uint a, uint b) external pure returns (uint) {
        return bmul(a, b);
    }

    function calc_bdiv(uint a, uint b) external pure returns (uint) {
        return bdiv(a, b);
    }

    function calc_bpowi(uint a, uint n) external pure returns (uint) {
        return bpowi(a, n);
    }

    function calc_bpow(uint base, uint exp) external pure returns (uint) {
        return bpow(base, exp);
    }

    function calc_bpowApprox(uint base, uint exp, uint precision) external pure returns (uint) {
        return bpowApprox(base, exp, precision);
    }
}
