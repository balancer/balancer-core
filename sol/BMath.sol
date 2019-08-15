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

pragma solidity ^0.5.10;

import "./BNum.sol";

contract BMath is BNum
{
    // Names
    // Bi := Balance In
    // Bo := Balance Out
    // Wi := Weight In
    // Wo := Weight Out
    // Ai := Amount In
    // Ao := Amount Out
    // Ti := Token In
    // To := Token Out

    function swapImath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ai
                      , uint256 fee
                      )
        public pure
        returns ( uint256 Ao )
    {
        bool flag;
        uint256 wRatio               = bdiv(Wi, Wo);
        uint256 adjustedIn;
        (adjustedIn, flag)           = bsubTry(ONE, fee);
        require( !flag, "BMath.swapImath");
        adjustedIn                   = bmul(Ai, adjustedIn);
        uint256 y                    = bdiv(Bi, badd(Bi, adjustedIn));
        uint256 foo                  = wpow(y, wRatio);
        uint256 bar;
        (bar, flag)                  = bsubTry(ONE, foo);
        require( !flag, "BMath.swapImath");
        Ao                           = bmul(Bo, bar);
	}

    function swapOmath( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo
                      , uint256 Ao
                      , uint256 fee
                      )
        public pure
        returns ( uint256 Ai )
    {
        bool flag;
        uint256 wRatio     = bdiv(Wo, Wi);
        uint256 diff;
        (diff, flag)       = bsubTry(Bo, Ao);
        require( !flag, "BMath.swapOmath");
        uint256 y          = bdiv(Bo, diff);
        uint256 foo        = wpow(y, wRatio);
        (foo,flag)         = bsubTry(foo, ONE);
        require( !flag, "BMath.swapOmath");
        (Ai,flag)             = bsubTry(ONE, fee);
        require( !flag, "BMath.swapOmath");
        Ai                 = bdiv(bmul(Bi, foo), Ai);
    }

    function spotPrice( uint256 Bi, uint256 Wi
                      , uint256 Bo, uint256 Wo )
        public pure
        returns ( uint256 r ) 
    {
        uint256 numer = bdiv(Bo, Wo);
        uint256 denom = bdiv(Bi, Wi);
        r = bdiv(numer, denom);
        return r;
    }

    function amountUpToPriceApprox( uint256 Bi
                                  , uint256 Wi
                                  , uint256 Bo
                                  , uint256 Wo
                                  , uint256 SER1
                                  , uint256 fee)
        public pure
        returns ( uint256 Ai )
    {
        bool flag;
        uint256 SER0 = spotPrice(Bi, Wi, Bo, Wo);
        uint256 base = bdiv(SER0, SER1);
        uint256 exp  = bdiv(Wo, add(Wo, Wi));
        (Ai,flag) = bsubTry(wpow(base, exp), ONE);
        require( !flag, "BMath.amountUpToPriceApprox");
        Ai = bmul(Ai, Bi);
        Ai = bdiv(Ai, sub(ONE, fee)); // TODO bsubTry, require etc
    }
}
