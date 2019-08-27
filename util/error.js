module.exports = {
    
    ERR_NONE               : -0x00,

    ERR_MATH_ADD_OVERFLOW  : -0x10,
    ERR_MATH_SUB_UNDERFLOW : -0x11,
    ERR_MATH_MUL_OVERFLOW  : -0x12,
    ERR_MATH_DIV_ZERO      : -0x13,
    ERR_MATH_DIV_INTERFLOW : -0x14, // intermdiate values overflow (we keep precision)

    ERR_MAX_TOKENS         : -0x20,
    ERR_MIN_WEIGHT         : -0x20,
    ERR_MAX_WEIGHT         : -0x21,
    ERR_MAX_TOTAL_WEIGHT   : -0x21,
    ERR_MAX_FEE            : -0x22,
    ERR_MIN_BALANCE        : -0x23,
    ERR_MAX_BALANCE        : -0x24,
    ERR_MAX_TRADE          : -0x25,

    // TODO: -3 limit types (in, out, price)
    ERR_LIMIT_FAILED       : -0x30,


    ERR_NOT_BOUND          : -0xe1,
    ERR_ALREADY_BOUND      : -0xe2,

    ERR_PAUSED             : -0xd0,
    ERR_UNJOINABLE         : -0xd1,
    ERR_BAD_CALLER         : -0xd2,

    ERR_ERC20_FALSE        : -0xe0,
    
    ERR_UNREACHABLE        : -0xff,


}

