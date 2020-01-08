const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const truffleAssert = require('truffle-assertions');

contract('BFactory', async (accounts) => {
    const admin = accounts[0];
    const nonAdmin = accounts[1];
    const user2 = accounts[2];
    const { toHex } = web3.utils;
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const { hexToUtf8 } = web3.utils;

    const MAX = web3.utils.toTwosComplement(-1);

    describe('Factory', () => {
        let factory;
        let pool;
        let POOL;
        let tokens;
        let WETH;
        let DAI;
        let weth;
        let dai;

        before(async () => {
            tokens = await TTokenFactory.deployed();
            factory = await BFactory.deployed();

            await tokens.build(toHex('WETH'), toHex('WETH'), 18);
            await tokens.build(toHex('DAI'), toHex('WETH'), 18);

            WETH = await tokens.get.call(toHex('WETH'));
            DAI = await tokens.get.call(toHex('DAI'));

            weth = await TToken.at(WETH);
            dai = await TToken.at(DAI);

            // admin balances
            await weth.mint(admin, toWei('5'));
            await dai.mint(admin, toWei('200'));

            // nonAdmin balances
            await weth.mint(nonAdmin, toWei('1'));
            await dai.mint(nonAdmin, toWei('50'));

            POOL = await factory.newBPool.call(); // this works fine in clean room
            await factory.newBPool();
            pool = await BPool.at(POOL);

            await weth.approve(POOL, MAX);
            await dai.approve(POOL, MAX);

            await weth.approve(POOL, MAX, { from: nonAdmin });
            await dai.approve(POOL, MAX, { from: nonAdmin });
        });

        it('BFactory is bronze release', async () => {
            const color = await factory.getColor();
            assert.equal(hexToUtf8(color), 'BRONZE');
        });

        it('isBPool on non pool returns false', async () => {
            const isBPool = await factory.isBPool(admin);
            assert.isFalse(isBPool);
        });

        it('isBPool on pool returns true', async () => {
            const isBPool = await factory.isBPool(POOL);
            assert.isTrue(isBPool);
        });

        it('fails nonAdmin calls collect', async () => {
            await truffleAssert.reverts(factory.collect(nonAdmin, { from: nonAdmin }), 'ERR_NOT_BLABS');
        });

        it('admin collects fees', async () => {
            await pool.bind(WETH, toWei('5'), toWei('5'));
            await pool.bind(DAI, toWei('200'), toWei('5'));

            await pool.finalize(toWei('100'));

            await pool.joinPool(toWei('10'), [MAX, MAX], { from: nonAdmin });
            await pool.exitPool(toWei('10'), [toWei('0'), toWei('0')], { from: nonAdmin });

            await factory.collect(POOL);

            const adminBalance = await pool.balanceOf(admin);

            assert.equal(fromWei(adminBalance), '100.001');
        });

        it('nonadmin cant set blabs address', async () => {
            await truffleAssert.reverts(factory.setBLabs(nonAdmin, { from: nonAdmin }), 'ERR_NOT_BLABS');
        });

        it('admin changes blabs address', async () => {
            await factory.setBLabs(user2);
            const blab = await factory.getBLabs();
            assert.equal(blab, user2);
        });
    });
});
