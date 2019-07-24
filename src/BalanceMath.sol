pragma solidity ^0.5.10;

// Study this
// https://github.com/dapphub/ds-math/blob/master/src/math.sol
import "ds-math/math.sol";

// Keep all functions public for now.
contract BalanceMath is DSMath {
    function getAmountOut(uint256 Qi, uint256 Qj, uint256 wi, uint256 wj)
        public pure returns (uint256)
    {
        uint256 rayExample = rmul(wi, wj);
        uint256 wadExample = add(Qi, Qj);
        return add(Qi, Qj);
    }
    
    function approximateAmountOutForSell(uint256 QOut, uint256 QIn, uint256 qIn, uint256 wIn, uint256 wOut) public pure returns (uint256) {
        if (wIn>wOut)
        // Expand power into two, first with integer exponent >=1 and second with exponent <1
        {
            uint256 precision = uint256(10) ** 18; // TODO Use norm_factor from Balancer instead of precision
            uint256 integerPower = power(precision,QIn,QIn+qIn,wIn/wOut);
            return QOut - (integerPower * binExpqOut(QOut, QIn, qIn, wIn%wOut, wOut)/precision);
        }
        // Use binomial expansion directly since exponent <1
        else{
            return QOut-binExpqOut(QOut, QIn, qIn, wIn, wOut);
        }

    }

     /**
     * @notice This function
     */
    function binExpqOut(uint256 QOut, uint256 QIn, uint256 qIn, uint256 wIn, uint256 wOut) public pure returns (uint256) {
        return QOut
            -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 1)
            -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 2)
            -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 3)
            -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 4)
            -BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, 5);
    }

    function BinExpqOutTermN(uint256 QOut, uint256 QIn, uint256 qIn, uint256 wIn, uint256 wOut, uint256 n) public pure returns (uint256) {
        if(n == 0){
            return QOut;
        }else if(n == 1)
        {
            return (((QOut*wIn)/wOut)*qIn)/(QIn+qIn)
        }
        else{
            return ((((BinExpqOutTermN(QOut, QIn, qIn, wIn, wOut, n-1)*
                ((n-1)*wOut-wIn))/wOut)*qIn)/n)/(QIn+qIn);
        }
    }

    function approximateAmountInForBuy(uint256 QOut, uint256 QIn, uint256 qOut, uint256 wIn, uint256 wOut) public pure returns (uint256) {
        if (wOut>wIn)
        // Expand power into two, first with integer exponent >=1 and second with exponent <1
        {
            uint256 precision = uint256(10) ** 18; // TODO Use norm_factor from Balancer instead of precision
            uint256 integerPower = power(precision,QOut,QOut-qOut,wOut/wIn);
            return (integerPower * binExpqIn(QOut, QIn, qOut, wIn, wOut%wIn))/precision - QIn;
        }
        // Use binomial expansion directly since exponent <1
        else{
            return binExpqIn(QOut, QIn, qOut, wIn, wOut)-QIn;
        }

    }

    /**
     * @notice This function
     */
    function binExpqIn(uint256 QOut, uint256 QIn, uint256 qOut, uint256 wIn, uint256 wOut) public pure returns (uint256) {
        return QIn
            +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 1)
            -binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 2)
            +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 3)
            -binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 4)
            +binExpqInTermN(QOut, QIn, qOut, wIn, wOut, 5);
    }

    function binExpqInTermN(uint256 QOut, uint256 QIn, uint256 qOut, uint256 wIn, uint256 wOut, uint256 n) public pure returns (uint256) {
        if(n == 0){
            return QIn;
        }else if(n == 1)
        {
            return (((QIn*wOut)/wIn)*qOut)/(QOut-qOut);
        }
        else{
            return ((((binExpqInTermN(QOut, QIn, qIn, wIn, wOut, n-1)*
                ((n-1)*wIn-wOut))/wIn)*qOut)/n)/(QOut-qOut);
        }
    }
}
