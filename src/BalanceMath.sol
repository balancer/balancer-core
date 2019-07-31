pragma solidity ^0.5.10;

// Study this
// https://github.com/dapphub/ds-math/blob/master/src/math.sol
import "ds-math/math.sol";
import "erc20/erc20.sol";

contract BalanceMath is DSMath
{
    // Extending `rpow` for ray-valued exponents
    // https://github.com/dapphub/ds-math/blob/master/src/math.sol
    function bpow(uint256 x, uint256 e)
        public pure
        returns (uint256) 
    {
        return 0;
    }

    function swapSpecifyInMath( uint256 tinBalance, uint256 tinWeight
                              , uint256 toutBalance, uint256 toutWeight
                              , uint256 tinAmount
                              , uint256 feeRatio
                              )
        public pure
        returns ( uint256 toutAmount, uint256 feeAmount )
    {
        // suppress warnings
            tinBalance = tinBalance;
            toutBalance = toutBalance;
        //
        toutAmount = wmul( tinAmount
                         , wdiv(tinWeight, toutWeight));
        feeAmount = wmul(feeRatio, tinAmount);
        return (toutAmount, feeAmount);
    }

    function ratio( uint256 tinBalance, uint256 tinWeight
                  , uint256 toutBalance, uint256 toutWeight )
        public pure
        returns ( uint256 r ) 
    {
        // suppress warnings
            tinWeight = tinWeight;
            tinBalance = tinBalance;
            toutWeight = toutWeight;
            toutBalance = toutBalance;

        return wdiv(tinWeight, toutWeight);
    }
}

contract BalanceMathConstant is BalanceMath
{
    function swapSpecifyInMath( uint256 tinBalance, uint256 tinWeight
                              , uint256 toutBalance, uint256 toutWeight
                              , uint256 tinAmount
                              , uint256 feeRatio
                              )
        public pure
        returns ( uint256 toutAmount, uint256 feeAmount )
    {
        // suppress warnings
            tinBalance = tinBalance;
            toutBalance = toutBalance;
        //
        toutAmount = wmul( tinAmount
                         , ratio( tinWeight, tinBalance
                                , toutWeight, toutBalance));
        feeAmount = wmul(feeRatio, tinAmount);
        return (toutAmount, feeAmount);
    }
}



