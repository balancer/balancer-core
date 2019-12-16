// All test points have been calculated with Wolfram Mathematica.
// See here: https://www.wolframcloud.com/obj/fernando.martinel/Published/test_extreme_weights.nb

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const errorDelta = 10 ** -8;
const swapFee = 0.001; // 0.001;
const exitFee = 0.0001; // 0.01;
const verbose = process.env.VERBOSE;

function calcRelativeDiff(_expected, _actual) {
    return Math.abs((_expected - _actual) / _expected);
}

contract('BPool', async () => {
    const { toHex } = web3.utils;
    const { toWei } = web3.utils;
    const MAX = web3.utils.toTwosComplement(-1);

    let tokens; // token factory / registry
    let DIRT; let ROCK;
    let dirt; let rock;
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    const dirtBalance = toWei('1000');
    let currentDirtBalance = parseInt(dirtBalance, 10) / 10 ** 18;
    let previousDirtBalance = currentDirtBalance;
    const dirtDenorm = toWei('1');

    const rockBalance = toWei('1000');
    let currentRockBalance = parseInt(rockBalance, 10) / 10 ** 18;
    let previousRockBalance = currentRockBalance;
    const rockDenorm = toWei('49');

    let currentPoolBalance = 0;
    let previousPoolBalance = 0;

    const sumWeights = parseInt(dirtDenorm, 10) + parseInt(rockDenorm, 10);
    const dirtNorm = parseInt(dirtDenorm, 10) / sumWeights;
    const rockNorm = parseInt(rockDenorm, 10) / sumWeights;

    async function logAndAssertCurrentBalances() {
        let expected = currentPoolBalance * 10 ** 18;
        let actual = await pool.totalSupply();
        let relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Pool Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif, errorDelta);

        expected = currentDirtBalance * 10 ** 18;
        actual = await pool.getBalance(DIRT);
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Dirt Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif, errorDelta);

        expected = currentRockBalance * 10 ** 18;
        actual = await pool.getBalance(ROCK);
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Rock Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif, errorDelta);
    }

    before(async () => {
        tokens = await TTokenFactory.deployed();
        factory = await BFactory.deployed();

        POOL = await factory.newBPool.call(); // this works fine in clean room
        await factory.newBPool();
        pool = await BPool.at(POOL);


        await tokens.build(toHex('DIRT'));
        await tokens.build(toHex('ROCK'));

        DIRT = await tokens.get(toHex('DIRT'));
        ROCK = await tokens.get(toHex('ROCK'));


        dirt = await TToken.at(DIRT);
        rock = await TToken.at(ROCK);

        await dirt.mint(MAX);
        await rock.mint(MAX);

        await dirt.approve(POOL, MAX);
        await rock.approve(POOL, MAX);


        await pool.bind(DIRT, dirtBalance, dirtDenorm);
        await pool.bind(ROCK, rockBalance, rockDenorm);

        await pool.setPublicSwap(true);

        await pool.setSwapFee(toWei(String(swapFee)));
    });

    describe('Extreme weights', () => {
    // TODO: swap parameters of all asserts -> correct order is (actual, expected)

        it('swapExactAmountIn', async () => {
            const tokenIn = DIRT;
            const tokenInAmount = toWei('500');
            const tokenOut = ROCK;
            const minAmountOut = toWei('0');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountIn.call(
                tokenIn, tokenInAmount, tokenOut, minAmountOut, maxPrice,
            );

            // Checking outputs
            let expected = toWei('8.23390841016124456');
            let actual = output.tokenAmountOut;
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            expected = toWei('74.1844011380065814');
            actual = output.spotPriceAfter;
            relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[1]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });


        it('swapExactAmountOut', async () => {
            const tokenIn = DIRT;
            const maxAmountIn = MAX;
            const tokenOut = ROCK;
            const tokenAmountOut = toWei('333.333333333333333333');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountOut.call(
                tokenIn, maxAmountIn, tokenOut, tokenAmountOut, maxPrice,
            );

            // Checking outputs
            let expected = toWei('425506505648.348073');
            let actual = output.tokenAmountIn;
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            expected = toWei('31306034272.9265099');
            actual = output.spotPriceAfter;
            relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[1]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });

        it('joinPool', async () => {
            currentPoolBalance = 100;
            await pool.finalize(toWei(String(currentPoolBalance)));

            // // Call function
            const pAo = 1;
            await pool.joinPool(toWei(String(pAo)));

            // // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance += pAo;
            // Balances of all tokens increase proportionally to the pool balance
            previousDirtBalance = currentDirtBalance;
            currentDirtBalance += (pAo / previousPoolBalance) * previousDirtBalance;
            previousRockBalance = currentRockBalance;
            currentRockBalance += (pAo / previousPoolBalance) * previousRockBalance;

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });

        it('exitPool', async () => {
            // Call function
            // so that the balances of all tokens will go back exactly to what they were before joinPool()
            const pAi = 1 / (1 - exitFee);
            const pAiAfterExitFee = pAi * (1 - exitFee);

            await pool.exitPool(toWei(String(pAi)));

            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance -= pAiAfterExitFee;
            // Balances of all tokens increase proportionally to the pool balance
            previousDirtBalance = currentDirtBalance;
            currentDirtBalance -= (pAiAfterExitFee / previousPoolBalance) * previousDirtBalance;
            previousRockBalance = currentRockBalance;
            currentRockBalance -= (pAiAfterExitFee / previousPoolBalance) * previousRockBalance;

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('joinswapExternAmountIn', async () => {
            // Call function
            const tokenRatio = 1.1;
            // increase tbalance by 1.1 after swap fee
            const tAi = (1 / (1 - swapFee * (1 - dirtNorm))) * (currentDirtBalance * (tokenRatio - 1));
            await pool.joinswapExternAmountIn(DIRT, toWei(String(tAi)));
            // Update balance states
            previousDirtBalance = currentDirtBalance;
            currentDirtBalance += tAi;
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance *= tokenRatio ** dirtNorm; // increase by 1.1**dirtNorm

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('joinswapPoolAmountOut', async () => {
            // Call function
            const poolRatio = 1.1;
            const pAo = currentPoolBalance * (poolRatio - 1);
            await pool.joinswapPoolAmountOut(toWei(String(pAo)), ROCK);
            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance *= poolRatio; // increase by 1.1
            previousRockBalance = currentRockBalance;
            const numer = previousRockBalance * (poolRatio ** (1 / rockNorm) - 1) * 1;
            const denom = (1 - swapFee * (1 - rockNorm));
            currentRockBalance += (numer / denom); // (21% + swap fees) addition to current Rock supply

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('exitswapPoolAmountIn', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const pAi = currentPoolBalance * (1 - poolRatioAfterExitFee) * (1 / (1 - exitFee));
            await pool.exitswapPoolAmountIn(toWei(String(pAi)), DIRT);
            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance -= pAi * (1 - exitFee);
            previousDirtBalance = currentDirtBalance;
            const mult = (1 - poolRatioAfterExitFee ** (1 / dirtNorm)) * (1 - swapFee * (1 - dirtNorm));
            currentDirtBalance -= previousDirtBalance * mult;

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('exitswapExternAmountOut', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const tokenRatioBeforeSwapFee = poolRatioAfterExitFee ** (1 / rockNorm);
            const tAo = currentRockBalance * (1 - tokenRatioBeforeSwapFee) * (1 - swapFee * (1 - rockNorm));
            await pool.exitswapExternAmountOut(ROCK, toWei(String(tAo)));
            // Update balance states
            previousRockBalance = currentRockBalance;
            currentRockBalance -= tAo;
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance -= previousPoolBalance * (1 - poolRatioAfterExitFee);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });

        it('pAo = joinswapExternAmountIn(joinswapPoolAmountOut(pAo))', async () => {
            const pAo = 0.1;
            const tAi = await pool.joinswapPoolAmountOut.call(toWei(String(pAo)), DIRT);
            const calculatedPAo = await pool.joinswapExternAmountIn.call(DIRT, String(tAi));

            const expected = pAo * 10 ** 18;
            const actual = calculatedPAo;
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`tAi: ${tAi})`);
                console.log('pAo');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });


        it('tAi = joinswapPoolAmountOut(joinswapExternAmountIn(tAi))', async () => {
            const tAi = '1';
            const pAo = await pool.joinswapExternAmountIn.call(ROCK, toWei(tAi));
            const calculatedtAi = await pool.joinswapPoolAmountOut.call(String(pAo), ROCK);

            const expected = toWei(tAi);
            const actual = calculatedtAi;
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`pAo: ${pAo})`);
                console.log('tAi');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });


        it('pAi = exitswapExternAmountOut(exitswapPoolAmountIn(pAi))', async () => {
            const pAi = 0.1;
            const tAo = await pool.exitswapPoolAmountIn.call(toWei(String(pAi)), DIRT);
            const calculatedPAi = await pool.exitswapExternAmountOut.call(DIRT, String(tAo));
            const expected = pAi * 10 ** 18;
            const actual = calculatedPAi;
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`tAo: ${tAo})`);
                console.log('pAi');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });


        it('tAo = exitswapPoolAmountIn(exitswapExternAmountOut(tAo))', async () => {
            const tAo = 1;
            const pAi = await pool.exitswapExternAmountOut.call(ROCK, toWei(String(tAo)));
            const calculatedtAo = await pool.exitswapPoolAmountIn.call(String(pAi), ROCK);

            const expected = tAo * 10 ** 18;
            const actual = calculatedtAo;
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`pAi: ${pAi})`);
                console.log('tAo');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);
        });
    });
});
