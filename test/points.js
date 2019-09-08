// [result
// , [args...] ]
module.exports.math = {
  // Ao = OutGivenIn(Bi, Wi, Bo, Wo, Ai, fee)
  calc_OutGivenIn: [
    [(1 - Math.pow((2 / (2 + 1)), (0.1 / 0.1))) * 2,
      [2, 1, 2, 1, 1, 0]],
    [(1 - Math.pow((20 / (20 + 10)), (0.1 / 0.1))) * 20,
      [20, 1, 20, 1, 10, 0]],
    [(1 - Math.pow((200 / (200 + 1)), (0.5 / 0.3))) * 20,
      [200, 5, 20, 3, 1, 0]],
    [(1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150, [235, 5, 150, 2, 32, 0]],
    [(1 - Math.pow((2 / (2 + 1 * 0.98)), (0.1 / 0.1))) * 2, [2, 1, 2, 1, 1, 0.02]],
    [(1 - Math.pow((20 / (20 + 10 * 0.99)), (0.1 / 0.1))) * 20, [20, 1, 20, 1, 10, 0.01]],
    [(1 - Math.pow((200 / (200 + 1 * 0.97)), (0.5 / 0.3))) * 20, [200, 5, 20, 3, 1, 0.03]],
    [(1 - Math.pow((235 / (235 + 32 * 0.9)), (0.5 / 0.2))) * 150, [235, 5, 150, 2, 32, 0.1]],

    ['ERR_MIN_BALANCE', [0, 5, 32, 150, 2, 0.1]],
    ['ERR_MIN_WEIGHT', [235, 0, 32, 150, 2, 0.1]],
    ['ERR_MAX_WEIGHT', [235, 5, 0, 150, 2, 0.1]],
    ['ERR_MIN_WEIGHT', [235, 5, 32, 0, 2, 0.1]],
    ['ERR_MAX_WEIGHT', [235, 5, 32, 150, 0, 0.1]]
  ],

  calc_InGivenOut: [
    [(Math.pow((2 / (2 - 1)), (0.1 / 0.1)) - 1) * 2,
      [2, 1, 2, 1, 1, 0]],
    [(Math.pow((20 / (20 - 10)), (0.1 / 0.1)) - 1) * 20,
      [20, 1, 20, 1, 10, 0]],
    [(Math.pow((600 / (600 - 4)), (0.3 / 0.5)) - 1) * 523,
      [523, 5, 600, 3, 4, 0]],
    [(Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600,
      [600, 5, 523, 2, 70, 0]],
    [(Math.pow((2 / (2 - 1)), (0.1 / 0.1)) - 1) * 2 / 0.98,
      [2, 1, 2, 1, 1, 0.02]],
    [(Math.pow((20 / (20 - 10)), (0.1 / 0.1)) - 1) * 20 / 0.99,
      [20, 1, 20, 1, 10, 0.01]],
    [(Math.pow((600 / (600 - 4)), (0.3 / 0.5)) - 1) * 523 / 0.97,
      [523, 5, 600, 3, 4, 0.03]],
    [(Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600 / 0.9,
      [600, 5, 523, 2, 70, 0.1]],

    ['ERR_', [0, 5, 523, 2, 70, 0.1]],
    ['ERR_', [600, 0, 523, 2, 70, 0.1]],
    ['ERR_', [600, 5, 0, 2, 70, 0.1]],
    ['ERR_', [600, 5, 523, 0, 70, 0.1]],
    ['ERR_', [600, 5, 523, 2, 0, 0.1]],

    ['ERR_', [2, 1, 2, 1, 1, 0]],
    ['ERR_', [20, 1, 20, 1, 10, 0]],
    ['ERR_', [2, 1, 2, 1, 1, 0.02]],
    ['ERR_', [20, 1, 20, 1, 10, 0.01]]
  ],

  // res = calc_InGivenPrice(Bi, Wi, Bo, Wo, SER1, fee)
  calc_InGivenPrice: [
    [1.08172405558, [10, 3, 5260, 3, 430, 0.02]],
    [1.06008957447, [10, 3, 5260, 3, 430, 0]],
    [0.12011996945, [10, 2, 4405, 1, 850, 0]],
    [0, [10, 5, 8810, 5, 881, 0]],
    [0.97653399825, [10, 2, 4600, 4, 200, 0]],
    [1.08172405558, [10, 3, 5260, 3, 430, 0.02]],
    [0.12133330247, [10, 2, 4405, 1, 850, 0.01]],
    [0, [10, 5, 8810, 5, 881, 0.03]],
    [1.08503777583, [10, 2, 4600, 4, 200, 0.1]],

    ['ERR_', [10, 2, 4600, 4, 114, 0.1]],

    ['ERR_', [0, 2, 4600, 4, 200, 0.1]],
    ['ERR_', [10, 0, 4600, 4, 200, 0.1]],
    ['ERR_', [10, 2, 0, 4, 200, 0.1]],
    ['ERR_', [10, 2, 4600, 0, 200, 0.1]],
    ['ERR_', [10, 2, 4600, 4, 0, 0.1]]
  ],

  calc_SpotPrice: [
    [4, [1, 2, 10, 5]],
    [1 / 4, [10, 5, 1, 2]],

    [0.00025, [6000, 3, 1, 2]],
    [1 / 0.00025, [1, 2, 6000, 3]],

    [1000, [10, 5, 6000, 3]],
    [1 / 1000, [6000, 3, 10, 5]],

    [1 / 1000, [6000, 3, 10, 5]],

    ['ERR_', [0, 2, 10, 5]],
    ['ERR_', [1, 0, 10, 5]],
    ['ERR_', [1, 2, 0, 5]],
    ['ERR_', [1, 2, 10, 0]]
  ]
}

module.exports.spotPricePoints = [

  { res: 4, Bi: 1, Wi: 2, Bo: 10, Wo: 5 },
  { res: 1 / 4, Bi: 10, Wi: 5, Bo: 1, Wo: 2 },

  { res: 0.00025, Bi: 6000, Wi: 3, Bo: 1, Wo: 2 },
  { res: 1 / 0.00025, Bi: 1, Wi: 2, Bo: 6000, Wo: 3 },

  { res: 1000, Bi: 10, Wi: 5, Bo: 6000, Wo: 3 },
  { res: 1 / 1000, Bi: 6000, Wi: 3, Bo: 10, Wo: 5 }
]

module.exports.calc_InGivenOutPoints = [
  { res: (Math.pow((2 / (2 - 1)), (0.1 / 0.1)) - 1) * 2, Bi: 2, Wi: 1, Bo: 2, Wo: 1, Ao: 1, fee: 0 }, // 2
  { res: (Math.pow((20 / (20 - 10)), (0.1 / 0.1)) - 1) * 20, Bi: 20, Wi: 1, Bo: 20, Wo: 1, Ao: 10, fee: 0 }, // 20
  { res: (Math.pow((600 / (600 - 4)), (0.3 / 0.5)) - 1) * 523, Bi: 523, Wi: 5, Bo: 600, Wo: 3, Ao: 4, fee: 0 },
  { res: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600, Bi: 600, Wi: 5, Bo: 523, Wo: 2, Ao: 70, fee: 0 },
  { res: (Math.pow((2 / (2 - 1)), (0.1 / 0.1)) - 1) * 2 / 0.98, Bi: 2, Wi: 1, Bo: 2, Wo: 1, Ao: 1, fee: 0.02 }, // 2
  { res: (Math.pow((20 / (20 - 10)), (0.1 / 0.1)) - 1) * 20 / 0.99, Bi: 20, Wi: 1, Bo: 20, Wo: 1, Ao: 10, fee: 0.01 }, // 20
  { res: (Math.pow((600 / (600 - 4)), (0.3 / 0.5)) - 1) * 523 / 0.97, Bi: 523, Wi: 5, Bo: 600, Wo: 3, Ao: 4, fee: 0.03 },
  { res: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600 / 0.9, Bi: 600, Wi: 5, Bo: 523, Wo: 2, Ao: 70, fee: 0.1 }
]

module.exports.StopOutGivenInPoints = [
  {
    res: (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: 32,
    fee: 0,
    Lo: 0
  },
  {
    res: (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: 32,
    fee: 0,
    Lo: (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150 - 1
  },
  {
    res: (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: 32,
    fee: 0,
    Lo: (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150
  }
  //    NO REVERT TESTING YET
//    {res: (1 - Math.pow((235/(235+32)),(0.5/0.2)))*150, Bi: 235, Wi: 0.5, Bo: 150, Wo: 0.2, Ai: 32, fee: 0,
//        Lo: (1 - Math.pow((235/(235+32)),(0.5/0.2)))*150 + 1},
]

module.exports.MaxInExactOutPoints = [
//    {res: (Math.pow((523/(523 - 70)), (0.2/0.5)) - 1) * 600, Bi: 600, Wi: 0.5, Bo: 523, Wo: 0.2, Ao: 70, fee: 0,
//        Li: 0},
//    {res: (Math.pow((523/(523 - 70)), (0.2/0.5)) - 1) * 600, Bi: 600, Wi: 0.5, Bo: 523, Wo: 0.2, Ao: 70, fee: 0,
//        Li: (Math.pow((523/(523 - 70)), (0.2/0.5)) - 1) * 600},
  {
    res: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: 70,
    fee: 0,
    Li: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600 + 1
  },
  {
    res: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: 70,
    fee: 0,
    Li: (Math.pow((523 / (523 - 70)), (0.2 / 0.5)) - 1) * 600 + 100
  }
]

const priceRatio = 0.95
let Ai_fromPrice = (Math.pow(1 / priceRatio, 0.2 / (0.2 + 0.5)) - 1) * 235
module.exports.ExactInLimitPricePoints = [
  {
    res: (1 - Math.pow((235 / (235 + Ai_fromPrice)), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: Ai_fromPrice,
    fee: 0,
    Lp: (150 / 0.2) / (235 / 0.5) * priceRatio
  },
  // lower Ai
  {
    res: (1 - Math.pow((235 / (235 + (Ai_fromPrice - 0.001))), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: Ai_fromPrice - 0.001,
    fee: 0,
    Lp: (150 / 0.2) / (235 / 0.5) * priceRatio
  },
  // lower Lp
  {
    res: (1 - Math.pow((235 / (235 + (Ai_fromPrice - 0.001))), (0.5 / 0.2))) * 150,
    Bi: 235,
    Wi: 5,
    Bo: 150,
    Wo: 2,
    Ai: Ai_fromPrice - 0.001,
    fee: 0,
    Lp: (150 / 0.2) / (235 / 0.5) * priceRatio * 0.95
  }
]

Ai_fromPrice = (Math.pow(1 / priceRatio, 0.2 / (0.2 + 0.5)) - 1) * 600
const Ao_fromPrice = (1 - (600 / (600 + Ai_fromPrice)) ** (0.5 / 0.2)) * 523
module.exports.LimitPriceInExactOutPoints = [
  {
    res: Ai_fromPrice,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: Ao_fromPrice,
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  },
  // continuity
  {
    res: (Math.pow(523 / (523 - (Ao_fromPrice)), 0.2 / 0.5) - 1) * 600,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: (Ao_fromPrice),
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  },
  // lower Lp
  {
    res: (Math.pow(523 / (523 - (Ao_fromPrice)), 0.2 / 0.5) - 1) * 600,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: (Ao_fromPrice),
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio * 0.95
  },
  // lower Ao
  {
    res: (Math.pow(523 / (523 - (Ao_fromPrice - 0.001)), 0.2 / 0.5) - 1) * 600,
    Bi: 600,
    Wi: 5,
    Bo: 523,
    Wo: 2,
    Ao: (Ao_fromPrice - 0.001),
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  }
]

const Lo = Ao_fromPrice - 1
const Li = (Math.pow(1 / 0.95, 0.2 / (0.2 + 0.5)) - 1) * 600
const tokenRatio = 0.95
module.exports.MaxInMinOutLimitPricePoints = [
  // Lp success
  {
    res: [(Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600,
      (1 - (600 / (600 + (Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600)) ** (0.5 / 0.2)) * 523],
    Bi: 600,
    Wi: 0.5,
    Li: Ai_fromPrice / tokenRatio,
    Bo: 523,
    Wo: 0.2,
    Lo: Ao_fromPrice * tokenRatio,
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  },
  {
    res: [(Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600,
      (1 - (600 / (600 + (Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600)) ** (0.5 / 0.2)) * 523],
    Bi: 600,
    Wi: 0.5,
    Li: Ai_fromPrice / (tokenRatio * tokenRatio),
    Bo: 523,
    Wo: 0.2,
    Lo: Ao_fromPrice * (tokenRatio * tokenRatio),
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  },

  // Lp fails on low Li
  {
    res: [(Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600 * tokenRatio,
      (1 - (600 / (600 + (Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600 * tokenRatio)) ** (0.5 / 0.2)) * 523],
    Bi: 600,
    Wi: 0.5,
    Li: Ai_fromPrice * tokenRatio,
    Bo: 523,
    Wo: 0.2,
    Lo: Ao_fromPrice * tokenRatio,
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  },
  {
    res: [(Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600 * tokenRatio,
      (1 - (600 / (600 + (Math.pow(1 / (priceRatio), 0.2 / (0.2 + 0.5)) - 1) * 600 * tokenRatio)) ** (0.5 / 0.2)) * 523],
    Bi: 600,
    Wi: 0.5,
    Li: Ai_fromPrice * tokenRatio,
    Bo: 523,
    Wo: 0.2,
    Lo: Ao_fromPrice * tokenRatio * tokenRatio,
    fee: 0,
    Lp: (523 / 0.2) / (600 / 0.5) * priceRatio
  }

]

module.exports.amountUpToPricePoints = [
  { res: 1.06008957447, Bi: 10, Wi: 0.3, Bo: 5260, Wo: 0.3, SER1: 430, fee: 0 },
  { res: 0.12011996945, Bi: 10, Wi: 0.2, Bo: 4405, Wo: 0.1, SER1: 850, fee: 0 },
  { res: 0, Bi: 10, Wi: 0.5, Bo: 8810, Wo: 0.5, SER1: 881, fee: 0 },
  { res: 0.97653399825, Bi: 10, Wi: 0.2, Bo: 4600, Wo: 0.4, SER1: 200, fee: 0 },
  { res: 1.08172405558, Bi: 10, Wi: 0.3, Bo: 5260, Wo: 0.3, SER1: 430, fee: 0.02 },
  { res: 0.12133330247, Bi: 10, Wi: 0.2, Bo: 4405, Wo: 0.1, SER1: 850, fee: 0.01 },
  { res: 0, Bi: 10, Wi: 0.5, Bo: 8810, Wo: 0.5, SER1: 881, fee: 0.03 },
  { res: 1.08503777583, Bi: 10, Wi: 0.2, Bo: 4600, Wo: 0.4, SER1: 200, fee: 0.1 }
]

module.exports.powPoints = [
  { res: 1.1 ** 1.5, base: 1.1, exp: 1.5 },
  { res: 0 ** 0, base: 1.0, exp: 0 },
  { res: 1.05 ** 0, base: 1.05, exp: 0 },
  { res: 1.01 ** 0.2, base: 1.01, exp: 0.2 },
  { res: 0.9 ** 1.5, base: 0.9, exp: 1.5 },
  { res: 0.95 ** 0, base: 0.95, exp: 0 },
  { res: 0.91 ** 0.2, base: 0.91, exp: 0.2 },
  { res: 0.9 ** 0.2, base: 0.9, exp: 0.2 },
  { res: 1.5 ** 1.5, base: 1.5, exp: 1.5 }
]

module.exports.valuePoints = [
  { res: 0, tokens: [] },
  {
    res: Math.pow(300, 0.399) * Math.pow(875, 0.2) * Math.pow(372, 0.001) * Math.pow(282, 0.3) * Math.pow(2, 0.1),
    tokens: [[300, 0.399],
      [875, 0.2],
      [372, 0.001],
      [282, 0.3],
      [2, 0.1]]
  }
]

module.exports.refSpotPricePoints = [
  {
    res: (526 / 0.32) / (Math.pow(526, 0.32) * Math.pow(300, 0.399) * Math.pow(874, 0.2) * Math.pow(375, 0.001) * Math.pow(282, 0.3) * Math.pow(2, 0.1)),
    tokens: [[526, 0.32],
      [300, 0.399],
      [874, 0.2],
      [375, 0.001],
      [282, 0.3],
      [2, 0.1]]
  }
]

module.exports.normalizedWeightPoints = [
  { res: 0, tokens: [] },
  {
    res: 0,
    tokens: [[0, 0],
      [526, 0.32],
      [300, 0.399],
      [874, 0.2],
      [375, 0.001],
      [282, 0.3],
      [2, 0.1]]
  },
  {
    res: 0.32 / (0.32 + 0.399 + 0.2 + 0.001 + 0.3 + 0.1),
    tokens: [[526, 0.32],
      [300, 0.399],
      [874, 0.2],
      [375, 0.001],
      [282, 0.3],
      [2, 0.1]]
  }
]

// let priceRatio   = 0.95
// let Ai_fromPrice = (Math.pow(1/priceRatio, 0.2/(0.2+0.5)) - 1) * 235
// Ai_fromPrice = (Math.pow(1/priceRatio, 0.2/(0.2+0.5)) - 1) * 600
// let Ao_fromPrice = (1 - (600/(600 + Ai_fromPrice))**(0.5/0.2)) * 523
// let Lo = Ao_fromPrice - 1;
// let Li = (Math.pow(1/0.95, 0.2/(0.2 + 0.5)) - 1) * 600
// let tokenRatio = 0.95
const price = (523 / 0.2) / (600 / 0.5)
module.exports.pool = {
  viewSwap_ExactInLimitPrice: [
    [
      [600, 600, 1], [5, 5, 1],
      [Ai_fromPrice * tokenRatio, Ai_fromPrice / tokenRatio, Ai_fromPrice * (1 - tokenRatio) * 2],
      [523, 523, 1], [2, 2, 1],
      [price * priceRatio, price * priceRatio, price * (1 - priceRatio)],
      [0, 0.03, 0.01]
    ],
    [
      [10, 100, 90], [1, 5, 4],
      [1, 101, 25],
      [10, 100, 90], [1, 5, 4],
      [5 / 100, 12 + 5 / 100, 3],
      [0, 0.02, 0.02]
    ]
  ],

  viewSwap_LimitPriceInExactOut: [
    [
      [600, 600, 1], [5, 5, 1], [523, 523, 1], [2, 2, 1],
      [Ao_fromPrice * tokenRatio, Ao_fromPrice / tokenRatio, Ao_fromPrice * (1 - tokenRatio) * 2],
      [price * priceRatio, price * priceRatio, price * (1 - priceRatio)],
      [0, 0.03, 0.01]
    ],
    [
      [10, 100, 90], [1, 5, 4],
      [10, 100, 90], [1, 5, 4],
      [1, 101, 25],
      [5 / 100, 12 + 5 / 100, 3],
      [0, 0.02, 0.02]
    ]
  ],

  viewSwap_MaxInMinOutLimitPrice: [
    // Lp success
    [
      [600, 600, 1], [5, 5, 1],
      [Ai_fromPrice * tokenRatio, Ai_fromPrice / tokenRatio, Ai_fromPrice * (1 - tokenRatio) * 2],
      [523, 523, 1], [2, 2, 1],
      [Ao_fromPrice * tokenRatio, Ao_fromPrice / tokenRatio, Ao_fromPrice * (1 - tokenRatio) * 2],
      [price * priceRatio, price * priceRatio, price * (1 - priceRatio) * 2],
      [0, 0.03, 0.01]
    ],
    [
      [10, 100, 90], [1, 5, 4],
      [1, 101, 25],
      [10, 100, 90], [1, 5, 4],
      [1, 101, 25],
      [5 / 100, 12 + 5 / 100, 3],
      [0, 0.02, 0.02]
    ]

    /*
        [
            [600, 600, 1], [0.5, 0.5, 1],
            [1, 700, 50],
            [523, 523, 1], [0.2, 0.2, 1],
            [1, 700, 50],
            [price/3, price, price /8],
            [0, 0.04, 0.01]
        ]
        */
  ],
  viewSwap_ExactInMinOut: [
    [
      [235, 235, 1], [5, 5, 1], [32, 32, 1], [150, 150, 1], [2, 2, 1], [0, 0, 1], [0, 0.02, 0.01]],
    [
      [235, 235, 1], [5, 5, 1], [32, 32, 1], [150, 150, 1], [2, 2, 1],
      [(1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150 - 1, (1 - Math.pow((235 / (235 + 32)), (0.5 / 0.2))) * 150 + 1, 1],
      [0, 0.02, 0.01]
    ]
  ],
  viewSwap_MaxInExactOut: [
    [
      [600, 600, 1], [5, 5, 1],
      [(Math.pow((523 / (523 - 70)), (2 / 5)) - 1) * 600 * tokenRatio,
        (Math.pow((523 / (523 - 70)), (2 / 5)) - 1) * 600 / tokenRatio,
        (Math.pow((523 / (523 - 70)), (2 / 5)) - 1) * 600 * (1 - tokenRatio) * 2],
      [523, 523, 1], [2, 2, 1],
      [70, 70, 1],
      [0, 0.02, 0.01]
    ]
  ]
}
