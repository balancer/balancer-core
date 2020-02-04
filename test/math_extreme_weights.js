const Decimal = require('decimal.js');
const truffleAssert = require('truffle-assertions');
const { calcRelativeDiff } = require('../lib/calc_comparisons');

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const errorDelta = 10 ** -8;
const swapFee = 0.001; // 0.001;
const exitFee = 0;
const verbose = process.env.VERBOSE;


contract('BPool', async (accounts) => {
    const admin = accounts[0];
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const MAX = web3.utils.toTwosComplement(-1);

    let WETH; let DAI;
    let weth; let dai;
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    const wethBalance = '1000';
    const wethDenorm = '1';

    let currentWethBalance = Decimal(wethBalance);
    let previousWethBalance = currentWethBalance;

    const daiBalance = '1000';
    const daiDenorm = '49';

    let currentDaiBalance = Decimal(daiBalance);
    let previousDaiBalance = currentDaiBalance;

    let currentPoolBalance = Decimal(0);
    let previousPoolBalance = Decimal(0);

    const sumWeights = Decimal(wethDenorm).add(Decimal(daiDenorm));
    const wethNorm = Decimal(wethDenorm).div(Decimal(sumWeights));
    const daiNorm = Decimal(daiDenorm).div(Decimal(sumWeights));

    async function logAndAssertCurrentBalances() {
        let expected = currentPoolBalance;
        let actual = await pool.totalSupply();
        actual = Decimal(fromWei(actual));
        let relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Pool Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif.toNumber(), errorDelta);

        expected = currentWethBalance;
        actual = await pool.getBalance(WETH);
        actual = Decimal(fromWei(actual));
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('WETH Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif.toNumber(), errorDelta);

        expected = currentDaiBalance;
        actual = await pool.getBalance(DAI);
        actual = Decimal(fromWei(actual));
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Dai Balance');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif.toNumber(), errorDelta);
    }

    before(async () => {
        factory = await BFactory.deployed();

        POOL = await factory.newBPool.call(); // this works fine in clean room
        await factory.newBPool();
        pool = await BPool.at(POOL);

        weth = await TToken.new('Wrapped Ether', 'WETH', 18);
        dai = await TToken.new('Dai Stablecoin', 'DAI', 18);

        WETH = weth.address;
        DAI = dai.address;

        await weth.mint(admin, MAX);
        await dai.mint(admin, MAX);

        await weth.approve(POOL, MAX);
        await dai.approve(POOL, MAX);


        await pool.bind(WETH, toWei(wethBalance), toWei(wethDenorm));
        await pool.bind(DAI, toWei(daiBalance), toWei(daiDenorm));

        await pool.setPublicSwap(true);

        await pool.setSwapFee(toWei(String(swapFee)));
    });

    describe('Extreme weights', () => {
        it('swapExactAmountIn', async () => {
            const tokenIn = WETH;
            const tokenInAmount = toWei('500');
            const tokenOut = DAI;
            const minAmountOut = toWei('0');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountIn.call(
                tokenIn, tokenInAmount, tokenOut, minAmountOut, maxPrice,
            );

            // Checking outputs
            let expected = Decimal('8.23390841016124456');
            let actual = Decimal(fromWei(output.tokenAmountOut));
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);

            expected = Decimal('74.1844011380065814');
            actual = Decimal(fromWei(output.spotPriceAfter));
            relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[1]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });


        it('swapExactAmountOut', async () => {
            const tokenIn = WETH;
            const maxAmountIn = MAX;
            const tokenOut = DAI;
            const tokenAmountOut = toWei('333.333333333333333333');
            const maxPrice = MAX;

            const output = await pool.swapExactAmountOut.call(
                tokenIn, maxAmountIn, tokenOut, tokenAmountOut, maxPrice,
            );

            // Checking outputs
            let expected = Decimal('425506505648.348073');
            let actual = Decimal(fromWei(output.tokenAmountIn));
            let relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[0]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);

            expected = Decimal('31306034272.9265099');
            actual = Decimal(fromWei(output.spotPriceAfter));
            relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log('output[1]');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });

        it('joinPool', async () => {
            currentPoolBalance = '100';
            await pool.finalize();

            // // Call function
            const poolAmountOut = '1';
            await pool.joinPool(toWei(poolAmountOut), [MAX, MAX]);

            // // Update balance states
            previousPoolBalance = Decimal(currentPoolBalance);
            currentPoolBalance = Decimal(currentPoolBalance).add(Decimal(poolAmountOut));

            // Balances of all tokens increase proportionally to the pool balance
            previousWethBalance = currentWethBalance;
            let balanceChange = (Decimal(poolAmountOut).div(previousPoolBalance)).mul(previousWethBalance);
            currentWethBalance = currentWethBalance.add(balanceChange);
            previousDaiBalance = currentDaiBalance;
            balanceChange = (Decimal(poolAmountOut).div(previousPoolBalance)).mul(previousDaiBalance);
            currentDaiBalance = currentDaiBalance.add(balanceChange);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });

        it('exitPool', async () => {
            // Call function
            // so that the balances of all tokens will go back exactly to what they were before joinPool()
            const poolAmountIn = 1 / (1 - exitFee);
            const poolAmountInAfterExitFee = Decimal(poolAmountIn).mul(Decimal(1).sub(exitFee));

            await pool.exitPool(toWei(String(poolAmountIn)), [toWei('0'), toWei('0')]);

            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance = currentPoolBalance.sub(poolAmountInAfterExitFee);
            // Balances of all tokens increase proportionally to the pool balance
            previousWethBalance = currentWethBalance;
            let balanceChange = (poolAmountInAfterExitFee.div(previousPoolBalance)).mul(previousWethBalance);
            currentWethBalance = currentWethBalance.sub(balanceChange);
            previousDaiBalance = currentDaiBalance;
            balanceChange = (poolAmountInAfterExitFee.div(previousPoolBalance)).mul(previousDaiBalance);
            currentDaiBalance = currentDaiBalance.sub(balanceChange);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('joinswapExternAmountIn', async () => {
            // Call function
            const tokenRatio = 1.1;
            // increase tbalance by 1.1 after swap fee
            const tokenAmountIn = (1 / (1 - swapFee * (1 - wethNorm))) * (currentWethBalance * (tokenRatio - 1));
            await pool.joinswapExternAmountIn(WETH, toWei(String(tokenAmountIn)), toWei('0'));
            // Update balance states
            previousWethBalance = currentWethBalance;
            currentWethBalance = currentWethBalance.add(Decimal(tokenAmountIn));
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance = currentPoolBalance.mul(Decimal(tokenRatio).pow(wethNorm)); // increase by 1.1**wethNorm

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });


        it('joinswapPoolAmountOut', async () => {
            // Call function
            const poolRatio = 1.1;
            const poolAmountOut = currentPoolBalance * (poolRatio - 1);
            await pool.joinswapPoolAmountOut(DAI, toWei(String(poolAmountOut)), MAX);
            // Update balance states
            previousPoolBalance = currentPoolBalance;
            currentPoolBalance = currentPoolBalance.mul(Decimal(poolRatio)); // increase by 1.1
            previousDaiBalance = currentDaiBalance;
            const numer = previousDaiBalance.mul(Decimal(poolRatio).pow(Decimal(1).div(daiNorm)).sub(Decimal(1)));
            const denom = Decimal(1).sub((Decimal(swapFee)).mul((Decimal(1).sub(daiNorm))));
            currentDaiBalance = currentDaiBalance.plus(numer.div(denom));

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });

        it('joinswapExternAmountIn should revert', async () => {
            // Call function
            const tokenRatio = 1.1;
            const tokenAmountIn = (1 / (1 - swapFee * (1 - wethNorm))) * (currentWethBalance * (tokenRatio));
            await truffleAssert.reverts(
                pool.joinswapExternAmountIn(WETH, toWei(String(tokenAmountIn)), toWei('0')),
                'ERR_MAX_IN_RATIO',
            );
        });

        it('joinswapPoolAmountOut should revert', async () => {
            // Call function
            const poolRatio = 0.9;
            const poolAmountOut = currentPoolBalance * (poolRatio);
            await truffleAssert.reverts(
                pool.joinswapPoolAmountOut(DAI, toWei(String(poolAmountOut)), MAX),
                'ERR_MAX_IN_RATIO',
            );
        });

        it('exitswapExternAmountOut should revert', async () => {
            // Call function
            const poolRatioAfterExitFee = 1.1;
            const tokenRatioBeforeSwapFee = poolRatioAfterExitFee ** (1 / daiNorm);
            const tokenAmountOut = currentDaiBalance * (1 - tokenRatioBeforeSwapFee) * (1 - swapFee * (1 - daiNorm));
            await truffleAssert.reverts(
                pool.exitswapExternAmountOut(DAI, toWei(String(tokenAmountOut)), MAX),
                'ERR_MAX_OUT_RATIO',
            );
        });

        it('exitswapPoolAmountIn should revert', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const poolAmountIn = currentPoolBalance * (1 - poolRatioAfterExitFee) * (1 / (1 - exitFee));
            await truffleAssert.reverts(
                pool.exitswapPoolAmountIn(WETH, toWei(String(poolAmountIn)), toWei('0')),
                'ERR_MAX_OUT_RATIO',
            );
        });

        it('exitswapExternAmountOut', async () => {
            // Call function
            const poolRatioAfterExitFee = 0.9;
            const tokenRatioBeforeSwapFee = poolRatioAfterExitFee ** (1 / daiNorm);
            const tokenAmountOut = currentDaiBalance * (1 - tokenRatioBeforeSwapFee) * (1 - swapFee * (1 - daiNorm));
            await pool.exitswapExternAmountOut(DAI, toWei(String(tokenAmountOut)), MAX);
            // Update balance states
            previousDaiBalance = currentDaiBalance;
            currentDaiBalance = currentDaiBalance.sub(Decimal(tokenAmountOut));
            previousPoolBalance = currentPoolBalance;
            const balanceChange = previousPoolBalance.mul(Decimal(1).sub(Decimal(poolRatioAfterExitFee)));
            currentPoolBalance = currentPoolBalance.sub(balanceChange);

            // Print current balances after operation
            await logAndAssertCurrentBalances();
        });

        it('poolAmountOut = joinswapExternAmountIn(joinswapPoolAmountOut(poolAmountOut))', async () => {
            const poolAmountOut = 0.1;
            const tokenAmountIn = await pool.joinswapPoolAmountOut.call(WETH, toWei(String(poolAmountOut)), MAX);
            const pAo = await pool.joinswapExternAmountIn.call(WETH, String(tokenAmountIn), toWei('0'));

            const expected = Decimal(poolAmountOut);
            const actual = Decimal(fromWei(pAo));
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`tokenAmountIn: ${tokenAmountIn})`);
                console.log('poolAmountOut');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });


        it('tokenAmountIn = joinswapPoolAmountOut(joinswapExternAmountIn(tokenAmountIn))', async () => {
            const tokenAmountIn = '1';
            const poolAmountOut = await pool.joinswapExternAmountIn.call(DAI, toWei(tokenAmountIn), toWei('0'));
            const calculatedtokenAmountIn = await pool.joinswapPoolAmountOut.call(DAI, String(poolAmountOut), MAX);

            const expected = Decimal(tokenAmountIn);
            const actual = Decimal(fromWei(calculatedtokenAmountIn));
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`poolAmountOut: ${poolAmountOut})`);
                console.log('tokenAmountIn');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });


        it('poolAmountIn = exitswapExternAmountOut(exitswapPoolAmountIn(poolAmountIn))', async () => {
            const poolAmountIn = 0.1;
            const tokenAmountOut = await pool.exitswapPoolAmountIn.call(WETH, toWei(String(poolAmountIn)), toWei('0'));
            const calculatedpoolAmountIn = await pool.exitswapExternAmountOut.call(WETH, String(tokenAmountOut), MAX);

            const expected = Decimal(poolAmountIn);
            const actual = Decimal(fromWei(calculatedpoolAmountIn));
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`tokenAmountOut: ${tokenAmountOut})`);
                console.log('poolAmountIn');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });


        it('tokenAmountOut = exitswapPoolAmountIn(exitswapExternAmountOut(tokenAmountOut))', async () => {
            const tokenAmountOut = 1;
            const poolAmountIn = await pool.exitswapExternAmountOut.call(DAI, toWei(String(tokenAmountOut)), MAX);
            const tAo = await pool.exitswapPoolAmountIn.call(DAI, String(poolAmountIn), toWei('0'));

            const expected = Decimal(tokenAmountOut);
            const actual = Decimal(fromWei(tAo));
            const relDif = calcRelativeDiff(expected, actual);

            if (verbose) {
                console.log(`poolAmountIn: ${poolAmountIn})`);
                console.log('tokenAmountOut');
                console.log(`expected: ${expected})`);
                console.log(`actual  : ${actual})`);
                console.log(`relDif  : ${relDif})`);
            }

            assert.isAtMost(relDif.toNumber(), errorDelta);
        });
    });
});
