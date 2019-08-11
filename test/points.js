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


