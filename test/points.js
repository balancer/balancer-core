// Result, Bi, Wi, Bo, Wo
module.exports.spotPricePoints = [
    {res: 4, Bi: 1, Wi: 0.2, Bo: 10, Wo: 0.5},
    {res: 1/4, Bi: 10, Wi: 0.5, Bo: 1, Wo: 0.2},

    {res: 0.00025, Bi: 6000, Wi: 0.3, Bo: 1, Wo: 0.2},
    {res: 1/0.00025, Bi: 1, Wi: 0.2, Bo: 6000, Wo: 0.3},

    {res: 1000, Bi: 10, Wi: 0.5, Bo: 6000, Wo: 0.3},
    {res: 1/1000, Bi: 6000, Wi: 0.3, Bo: 10, Wo: 0.5}
];

// result, Bi, Wi, Bo, Wo, Ai, fee
var swapImathPoints = [
    [2/3, 2, 1, 2, 1, 1, 0],
    [20/3, 20, 10, 20, 10, 10, 0],
    [10/9, 2, 1, 2, 0.5, 1, 0],
    [2*(1-Math.pow(2/3, 1/2)), 2, 0.5, 2, 1, 1, 0],
]


