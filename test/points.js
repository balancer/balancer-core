module.exports.spotPricePoints = [
    {res: 4, Bi: 1, Wi: 0.2, Bo: 10, Wo: 0.5},
    {res: 1/4, Bi: 10, Wi: 0.5, Bo: 1, Wo: 0.2},

    {res: 0.00025, Bi: 6000, Wi: 0.3, Bo: 1, Wo: 0.2},
    {res: 1/0.00025, Bi: 1, Wi: 0.2, Bo: 6000, Wo: 0.3},

    {res: 1000, Bi: 10, Wi: 0.5, Bo: 6000, Wo: 0.3},
    {res: 1/1000, Bi: 6000, Wi: 0.3, Bo: 10, Wo: 0.5}
];

module.exports.swapImathPoints = [
    {res: 2/3, Bi: 2, Wi: 1, Bo: 2, Wo: 1, Ai: 1, fee: 0},
    {res: 20/3, Bi: 20, Wi: 10, Bo: 20, Wo: 10, Ai: 10, fee: 0},
    {res: 10/9, Bi: 2, Wi: 1, Bo: 2, Wo: 0.5, Ai: 1, fee: 0},
    {res: 2*(1-Math.pow(2/3, 1/2)), Bi: 2, Wi: 0.5, Bo: 2, Wo: 1, Ai: 1, fee: 0},
]

module.exports.spotPriceImathPoints = [
    {res: 10, SER0: 400, Bi: 10, Wi: 0.3, SER1: 100, Wo: 0.3},
    {res: 0,  SER0: 400, Bi: 10, Wi: 0.3, SER1: 400, Wo: 0.3},
    {res: 20, SER0: 900, Bi: 10, Wi: 0.3, SER1: 100, Wo: 0.3},
];

module.exports.powPoints = [
    {res: 0.1 ** 1.5,    base: 0.1, exp: 1.5},
    {res: 0 ** 0,        base: 0.0,   exp: 0},
    {res: 1,             base: 0.05, exp: 0},
    {res: 0.5 ** 0.5,    base: 0.5, exp: 0.5},
    {res: 0.01 ** 0.2,   base: 0.01, exp: 0.2},
];




