const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const errorDelta = 10 ** -8;
const verbose = process.env.VERBOSE;

function calcRelativeDiff(_expected, _actual) {
    return Math.abs((_expected - _actual) / _expected);
}

contract('math tests from canonical setup', async () => {
    const { toHex } = web3.utils;
    const { toWei } = web3.utils;

    const MAX = web3.utils.toTwosComplement(-1);

    let tokens; // token factory / registry
    let DIRT; let ROCK; let
        SAND; // addresses
    let dirt; let rock; let
        sand; // TTokens
    let factory; // BPool factory
    let pool; // first pool w/ defaults
    let POOL; //   pool address

    const dirtBalance = toWei('6');
    const dirtDenorm = toWei('10');

    const rockBalance = toWei('8');
    const rockDenorm = toWei('10');

    const sandBalance = toWei('24');
    const sandDenorm = toWei('20');

    const sumWeights = parseInt(dirtDenorm, 10) + parseInt(rockDenorm, 10);
    const dirtNorm = parseInt(dirtDenorm, 10) / sumWeights;
    const rockNorm = parseInt(rockDenorm, 10) / sumWeights;

    before(async () => {
        tokens = await TTokenFactory.deployed();
        factory = await BFactory.deployed();

        POOL = await factory.newBPool.call(); // this works fine in clean room
        await factory.newBPool();
        pool = await BPool.at(POOL);


        await tokens.build(toHex('DIRT'));
        await tokens.build(toHex('ROCK'));
        await tokens.build(toHex('SAND'));

        DIRT = await tokens.get.call(toHex('DIRT'));
        ROCK = await tokens.get.call(toHex('ROCK'));
        SAND = await tokens.get.call(toHex('SAND'));

        dirt = await TToken.at(DIRT);
        rock = await TToken.at(ROCK);
        sand = await TToken.at(SAND);

        await dirt.mint(MAX);
        await rock.mint(MAX);
        await sand.mint(MAX);

        await dirt.approve(POOL, MAX);
        await rock.approve(POOL, MAX);
        await sand.approve(POOL, MAX);


        await pool.bind(DIRT, dirtBalance, dirtDenorm);
        await pool.bind(ROCK, rockBalance, rockDenorm);
        await pool.bind(SAND, sandBalance, sandDenorm);

        await pool.setPublicSwap(true);
    });

    it('swapExactMarginalPrice', async () => {
        const MarPrice = 1;

        const output = await pool.swapExactMarginalPrice.call(DIRT, MAX, ROCK, '0', toWei(String(MarPrice)));
        const Ai = parseInt(output[0], 10);
        const Ao = parseInt(output[1], 10);

        // Checking outputs
        let expected = toWei(String(48 ** 0.5 - 6));
        let actual = Ai;
        let relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Ai');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif, errorDelta);


        expected = toWei(String(8 - 48 ** 0.5));
        actual = Ao;
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log('Ao');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }
        assert.isAtMost(relDif, errorDelta);

        // Checking outputs
        expected = MarPrice;
        actual = ((parseInt(dirtBalance, 10) + Ai) * rockNorm) / ((parseInt(rockBalance, 10) - Ao) * dirtNorm);
        relDif = calcRelativeDiff(expected, actual);
        if (verbose) {
            console.log(`Ai: ${Ai})`);
            console.log(`Ao: ${Ao})`);
            console.log('MarPrice');
            console.log(`expected: ${expected})`);
            console.log(`actual  : ${actual})`);
            console.log(`relDif  : ${relDif})`);
        }

        assert.isAtMost(relDif, errorDelta);
    });
});
