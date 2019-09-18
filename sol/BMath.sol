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

}
