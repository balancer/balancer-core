const { calcOutGivenIn, calcRelativeDiff } = require('../lib/calc_comparisons.js');

const truffleAssert = require('truffle-assertions');

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

const errorDelta = 10 ** -8;
const verbose = process.env.VERBOSE;

contract('BPool', async (accounts) => {
    const admin = accounts[0];
    const user1 = accounts[1];
    const { toHex } = web3.utils;
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const errorDelta = 10 ** -8;
    const MAX = web3.utils.toTwosComplement(-1);

    let tokens; // token factory / registry
    let WETH; let USDC; // addresses
    let weth; let usdc; // TTokens
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    before(async () => {
        tokens = await TTokenFactory.deployed();
        factory = await BFactory.deployed();

        POOL = await factory.newBPool.call();
        await factory.newBPool();
        pool = await BPool.at(POOL);

        await tokens.build(toHex('WETH'), toHex('WETH'), 18);
        await tokens.build(toHex('USDC'), toHex('USDC'), 6);

        WETH = await tokens.get.call(toHex('WETH'));
        USDC = await tokens.get.call(toHex('USDC'));

        weth = await TToken.at(WETH);
        usdc = await TToken.at(USDC);

        await weth.approve(POOL, MAX);
        await usdc.approve(POOL, MAX);

        usdcBalance = 101000000 * 10**6;

        await weth.mint(admin, toWei('1.5'));
        await usdc.mint(admin, usdcBalance);

        await pool.bind(WETH, toWei('1'), toWei('5'));
        await pool.bind(USDC, toHex(100000000 * 10**6), toWei('5'));

        await pool.setPublicSwap(true);

    });

    it('swapExactAmountIn', async () => {

        // USDC -> WETH
        let tokenAmountIn = 100;
        let minAmountOut = toWei('0');
        let maxPrice = MAX;

        let swapFee = await pool.getSwapFee()

        const output = await pool.swapExactAmountIn.call(USDC, toHex(tokenAmountIn * 10**6), WETH, minAmountOut, maxPrice);

        // Checking outputs
        let expected = calcOutGivenIn(100000000, 0.5, 1, 0.5, tokenAmountIn, fromWei(swapFee))
        let actual = fromWei(output[0]);
        let relDif = calcRelativeDiff(expected, actual);

        if (verbose) {
            console.log('output[0]');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif.decimalPlaces(18), errorDelta);

    });

});