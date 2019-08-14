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
    {res: 1.06008957447, Bi: 10, Wi: 0.3, Bo: 5260, Wo: 0.3, SER1: 430, fee: 0},//SER0: 526, SER1: 430, Wi: 0.3, Wo: 0.3, Bi: 10, fee: 0},
    {res: 0.12011996945, Bi: 10, Wi: 0.2, Bo: 4405, Wo: 0.1, SER1: 850, fee: 0},//SER0: 881, SER1: 850, Wi: 0.2, Wo: 0.1, Bi: 10, fee: 0},
    {res: 0,             Bi: 10, Wi: 0.5, Bo: 8810, Wo: 0.5, SER1: 881, fee: 0},//SER0: 881, SER1: 881, Wi: 0.5, Wo: 0.5, Bi: 10, fee: 0},
    {res: 0.97653399825, Bi: 10, Wi: 0.2, Bo: 4600, Wo: 0.4, SER1: 200, fee: 0},//SER0: 230, SER1: 200, Wi: 0.2, Wo: 0.4, Bi: 10, fee: 0},
];

module.exports.powPoints = [
    {res: 1.1 ** 1.5,    base: 1.1, exp: 1.5},
    {res: 0 ** 0,        base: 1.0,   exp: 0},
    {res: 1.05 ** 0,     base: 1.05, exp: 0},
    {res: 1.01 ** 0.2,   base: 1.01, exp: 0.2},
    {res: 0.9 ** 1.5,    base: 0.9, exp: 1.5},
    {res: 0.95 ** 0,     base: 0.95, exp: 0},
    {res: 0.91 ** 0.2,   base: 0.91, exp: 0.2},
    {res: 0.9 ** 0.2,    base: 0.9, exp: 0.2},
    {res: 2 ** 2,        base: 2, exp: 2},
];




