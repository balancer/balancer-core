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
    function calc_SpotPrice( uint Bi, uint Wi
                           , uint Bo, uint Wo )
      public pure
        returns ( uint r ) 
    {
        return _calc_SpotPrice(Bi, Wi, Bo, Wo);
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

    function calc_InGivenPrice( uint Bi, uint Wi
                              , uint Bo , uint Wo
                              , uint SER1
                              , uint fee)
      public pure
        returns ( uint Ai )
    {
        return _calc_InGivenPrice(Bi, Wi, Bo, Wo, SER1, fee);
    }

    function calc_bpow(uint base, uint exp)
      public pure
        returns (uint)
    {
        return bpow(base, exp);
    }

}
