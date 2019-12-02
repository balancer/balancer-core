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
    function calc_SpotPrice(
                uint tokenBalanceIn,
                uint tokenWeightIn,
                uint tokenBalanceOut,
                uint tokenWeightOut,
                uint swapFee
    )
        external pure
        returns ( uint spotPrice ) 
    {
        return _calc_SpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee);
    }

    function calc_OutGivenIn(
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
        return _calc_OutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee);
    }

    function calc_InGivenOut(
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
        return _calc_InGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee);
    }

    function calc_PoolOutGivenSingleIn(
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
        return  _calc_PoolOutGivenSingleIn( tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight , tokenAmountIn, swapFee);
    }

    function calc_SingleInGivenPoolOut(
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
        return _calc_SingleInGivenPoolOut( tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, poolAmountOut, swapFee);
    }

    function calc_SingleOutGivenPoolIn(
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
        return _calc_SingleOutGivenPoolIn( tokenBalanceOut, tokenWeightOut, poolSupply, totalWeight, poolAmountIn, swapFee);
    }

    function calc_PoolInGivenSingleOut(
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
        return _calc_PoolInGivenSingleOut( tokenBalanceOut, tokenWeightOut, poolSupply, totalWeight, tokenAmountOut, swapFee);
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
