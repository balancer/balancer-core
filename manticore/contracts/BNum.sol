// This file is a flatenen verison of BNum
// where require(cond, string) where replaced by require(cond)
// To allow SkipRequire to work properly
// It won't be needed once https://github.com/trailofbits/manticore/issues/1593 is added

contract BConst {
    uint internal constant BONE              = 10**18;

    uint internal constant MAX_BOUND_TOKENS  = 8;
    uint internal constant BPOW_PRECISION    = BONE / 10**10;

    uint internal constant MIN_FEE           = BONE / 10**6;
    uint internal constant MAX_FEE           = BONE / 10;
    uint internal constant EXIT_FEE          = BONE / 10000;

    uint internal constant MIN_WEIGHT        = BONE;
    uint internal constant MAX_WEIGHT        = BONE * 50;
    uint internal constant MAX_TOTAL_WEIGHT  = BONE * 50;
    uint internal constant MIN_BALANCE       = BONE / 10**12;
    uint internal constant MAX_BALANCE       = BONE * 10**12;

    uint internal constant MIN_POOL_SUPPLY   = BONE;

    uint internal constant MIN_BPOW_BASE     = 1 wei;
    uint internal constant MAX_BPOW_BASE     = (2 * BONE) - 1 wei;

    uint internal constant MAX_IN_RATIO      = BONE / 2;
    uint internal constant MAX_OUT_RATIO     = (BONE / 3) + 1 wei;

}
contract BNum is BConst {


    function badd(uint a, uint b)
        internal pure
        returns (uint)
    {
        uint c = a + b;
        require(c >= a);
        return c;
    }

    function bsub(uint a, uint b)
        internal pure
        returns (uint)
    {
        (uint c, bool flag) = bsubSign(a, b);
        require(!flag);
        return c;
    }

    function bsubSign(uint a, uint b)
        internal pure
        returns (uint, bool)
    {
        if (a >= b) {
            return (a - b, false);
        } else {
            return (b - a, true);
        }
    }

    function bmul(uint a, uint b)
        internal pure
        returns (uint)
    {
        uint c0 = a * b;
        require(a == 0 || c0 / a == b);
        uint c1 = c0 + (BONE / 2);
        require(c1 >= c0);
        uint c2 = c1 / BONE;
        return c2;
    }

    function bdiv(uint a, uint b)
        internal pure
        returns (uint)
    {
        require(b != 0);
        uint c0 = a * BONE;
        require(a == 0 || c0 / a == BONE); // bmul overflow
        uint c1 = c0 + (b / 2);
        require(c1 >= c0); //  badd require
        uint c2 = c1 / b;
        return c2;
    }

}