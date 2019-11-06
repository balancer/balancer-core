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

import "../BMath.sol";
import "../BNum.sol";

// Contract to wrap internal functions for testing

contract TMath is BMath {
    function NumBtoi(uint a) external pure returns (uint) {
        return btoi(a);
    }

    function NumBfloor(uint a) external pure returns (uint) {
        return bfloor(a);
    }

    function NumBadd(uint a, uint b) external pure returns (uint) {
        return badd(a, b);
    }

    function NumBsub(uint a, uint b) external pure returns (uint) {
        return bsub(a, b);
    }

    function NumBsubSign(uint a, uint b) external pure returns (uint, bool) {
        return bsubSign(a, b);
    }

    function NumBmul(uint a, uint b) external pure returns (uint) {
        return bmul(a, b);
    }

    function NumBdiv(uint a, uint b) external pure returns (uint) {
        return bdiv(a, b);
    }

    function NumBpowi(uint a, uint n) external pure returns (uint) {
        return bpowi(a, n);
    }

    function NumBpow(uint base, uint exp) external pure returns (uint) {
        return bpow(base, exp);
    }

    function NumBpowApprox(uint base, uint exp, uint precision) external pure returns (uint) {
        return bpowApprox(base, exp, precision);
    }
}
