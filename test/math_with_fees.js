const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const errorDelta = 10 ** -8;
const swapFee = 10 ** -3; // 0.001;
const exitFee = 0.0001;
const verbose = process.env.VERBOSE;

function calcRelativeDiff(_expected, _actual) {
    return Math.abs((_expected - _actual) / _expected);
}

contract('BPool', async (accounts) => {
    const { toHex } = web3.utils;
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const admin = accounts[0];

    const MAX = web3.utils.toTwosComplement(-1);

    let tokens; // token factory / registry
    let DIRT; let ROCK; // addresses
    let dirt; let rock; // TTokens
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    const dirtBalance = toWei('4');
    let currentDirtBalance = parseInt(dirtBalance, 10) / 10 ** 18;
    let previousDirtBalance = currentDirtBalance;
    const dirtDenorm = toWei('10');

    const rockBalance = toWei('12');
    let currentRockBalance = parseInt(rockBalance, 10) / 10 ** 18;
    let previousRockBalance = currentRockBalance;
    const rockDenorm = toWei('10');

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

        await tokens.build(toHex('DIRT'), toHex('DIRT'), 18);
        await tokens.build(toHex('ROCK'), toHex('ROCK'), 18);

        DIRT = await tokens.get(toHex('DIRT'));
        ROCK = await tokens.get(toHex('ROCK'));

        dirt = await TToken.at(DIRT);
        rock = await TToken.at(ROCK);

        await dirt.mint(admin, MAX);
        await rock.mint(admin, MAX);

        await dirt.approve(POOL, MAX);
        await rock.approve(POOL, MAX);

        await pool.bind(DIRT, dirtBalance, dirtDenorm);
        await pool.bind(ROCK, rockBalance, rockDenorm);

        await pool.setPublicSwap(true);
        await pool.setSwapFee(toWei(String(swapFee)));
    });

    describe('With fees', () => {
        it('swapExactAmountIn', async () => {
            const tokenIn = DIRT;
            const tokenAmountIn = toWei('2');
            const tokenOut = ROCK;
            const minAmountOut = toWei('0');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountIn.call(tokenIn, tokenAmountIn, tokenOut, minAmountOut, maxPrice);

            // Checking outputs
            let expected = 12 - 48 / (4 + 2 * (1 - swapFee));
            let actual = fromWei(output[0]);
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            // expected = 1 / ((1 - swapFee) * (4 + 2)) / (48 / (4 + 2 * (1 - swapFee)));
            expected = ((1 / (1 - swapFee)) * (4 + 2)) / (48 / (4 + 2 * (1 - swapFee)));
            actual = fromWei(output[1]);
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
            const tokenIn = ROCK;
            const maxAmountIn = MAX;
            const tokenOut = DIRT;
            const tokenAmountOut = toWei('1');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountOut.call(tokenIn, maxAmountIn, tokenOut, tokenAmountOut, maxPrice);

            // Checking outputs
            let expected = (48 / (4 - 1) - 12) / (1 - swapFee);
            let actual = fromWei(output[0]);
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            expected = ((1 / (1 - swapFee)) * (12 + ((48 / (4 - 1) - 12) / (1 - swapFee)))) / (4 - 1);
            actual = fromWei(output[1]);
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

            // Call function
            const pAo = 1;
            await pool.joinPool(toWei(String(pAo)), [MAX, MAX]);

            // Update balance states
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

            await pool.exitPool(toWei(String(pAi)), [toWei('0'), toWei('0')]);

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
            const poolRatio = 1.1;
            // increase tbalance by 1.1^2 after swap fee
            const tAi = (1 / (1 - swapFee * (1 - dirtNorm))) * (currentDirtBalance * (poolRatio ** (1 / dirtNorm) - 1));

            const pAo = await pool.joinswapExternAmountIn.call(DIRT, toWei(String(tAi)), toWei('0'));
            // Execute txn called above
            await pool.joinswapExternAmountIn(DIRT, toWei(String(tAi)), toWei('0'));

            // Update balance states
            previousDirtBalance = currentDirtBalance;
            currentDirtBalance += tAi;
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance *= poolRatio; // increase by 1.1

            // Check pAo
            const expected = (currentPoolBalance - previousPoolBalance); // poolRatio = 1.1
            const actual = fromWei(pAo);
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('pAo');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }
            assert.isAtMost(relDif, errorDelta);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('joinswapPoolAmountOut', async () => {
            // Call function
            const poolRatio = 1.1;
            const pAo = currentPoolBalance * (poolRatio - 1);

            const tAi = await pool.joinswapPoolAmountOut.call(toWei(String(pAo)), ROCK, MAX); // 10% of current supply
            await pool.joinswapPoolAmountOut(toWei(String(pAo)), ROCK, MAX);

            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance *= poolRatio; // increase by 1.1
            previousRockBalance = currentRockBalance;
            // (21% + swap fees) addition to current Rock supply ;
            const numer = (previousRockBalance * ((poolRatio ** (1 / rockNorm) - 1) * 1));
            const denom = (1 - swapFee * (1 - rockNorm));
            currentRockBalance += (numer / denom);

            // Check tAi
            const expected = (currentRockBalance - previousRockBalance); // 0.4641 -> 1.1^4 - 1 = 0.4641
            const actual = fromWei(tAi);
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('tAi');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }
            assert.isAtMost(relDif, errorDelta);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('exitswapPoolAmountIn', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const pAi = currentPoolBalance * (1 - poolRatioAfterExitFee) * (1 / (1 - exitFee));

            const tAo = await pool.exitswapPoolAmountIn.call(toWei(String(pAi)), DIRT, toWei('0'));
            await pool.exitswapPoolAmountIn(toWei(String(pAi)), DIRT, toWei('0'));

            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance -= pAi * (1 - exitFee);
            previousDirtBalance = currentDirtBalance;
            const mult = (1 - poolRatioAfterExitFee ** (1 / dirtNorm)) * (1 - swapFee * (1 - dirtNorm));
            currentDirtBalance -= previousDirtBalance * mult;

            // Check tAo
            const expected = (previousDirtBalance - currentDirtBalance); // 0.4641 -> 1.1^4 - 1 = 0.4641
            const actual = fromWei(tAo);
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('tAo');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('exitswapExternAmountOut', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const tokenRatioBeforeSwapFee = poolRatioAfterExitFee ** (1 / rockNorm);
            const tAo = currentRockBalance * (1 - tokenRatioBeforeSwapFee) * (1 - swapFee * (1 - rockNorm));

            const pAi = await pool.exitswapExternAmountOut.call(ROCK, toWei(String(tAo)), MAX);
            await pool.exitswapExternAmountOut(ROCK, toWei(String(tAo)), MAX);

            // Update balance states
            previousRockBalance = currentRockBalance;
            currentRockBalance -= tAo;
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance -= previousPoolBalance * (1 - poolRatioAfterExitFee);

            // check pAi
            // Notice the (1-exitFee) term since only pAi*(1-exitFee) is burned
            const expected = (previousPoolBalance - currentPoolBalance) / (1 - exitFee);
            const actual = fromWei(pAi);
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('pAi');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif, errorDelta);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('pAo = joinswapExternAmountIn(joinswapPoolAmountOut(pAo))', async () => {
            const pAo = 10;
            const tAi = await pool.joinswapPoolAmountOut.call(toWei(String(pAo)), DIRT, MAX);
            const calculatedPAo = await pool.joinswapExternAmountIn.call(DIRT, String(tAi), toWei('0'));

            const expected = pAo;
            const actual = fromWei(calculatedPAo);
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
            const tAi = 1;
            const pAo = await pool.joinswapExternAmountIn.call(ROCK, toWei(String(tAi)), toWei('0'));
            const calculatedtAi = await pool.joinswapPoolAmountOut.call(String(pAo), ROCK, MAX);

            const expected = tAi;
            const actual = fromWei(calculatedtAi);
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
            const pAi = 10;
            const tAo = await pool.exitswapPoolAmountIn.call(toWei(String(pAi)), DIRT, toWei('0'));
            const calculatedPAi = await pool.exitswapExternAmountOut.call(DIRT, String(tAo), MAX);

            const expected = pAi;
            const actual = fromWei(calculatedPAi);
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
            const tAo = '1';
            const pAi = await pool.exitswapExternAmountOut.call(ROCK, toWei(tAo), MAX);
            const calculatedtAo = await pool.exitswapPoolAmountIn.call(String(pAi), ROCK, toWei('0'));

            const expected = tAo;
            const actual = fromWei(calculatedtAo);
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
