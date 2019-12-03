const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const truffleAssert = require('truffle-assertions');

contract('BPool', async (accounts) => {
    const admin = accounts[0];
    const nonAdmin = accounts[1];
    const { toWei } = web3.utils;

    describe('Admin controller', () => {
        let pool;
        let POOL;

        before(async () => {
            const factory = await BFactory.deployed();

            POOL = await factory.newBPool.call(); // this works fine in clean room
            await factory.newBPool();
            pool = await BPool.at(POOL);
        });

        it('Controller is msg.sender', async () => {
            const controller = await pool.getController();
            assert.equal(controller, admin);
        });

        it('Only controller can setPublicSwap', async () => {
            await pool.setPublicSwap(true);
            const publicSwap = pool.isPublicSwap();
            assert(publicSwap);
            await truffleAssert.reverts(pool.setPublicSwap(true, { from: nonAdmin }), 'ERR_NOT_CONTROLLER');
        });

        it('Cant setPublicSwap, setSwapFee when finalized', async () => {
            await pool.finalize(toWei('10'));
            const finalized = pool.isFinalized();
            assert(finalized);
            await truffleAssert.reverts(pool.setPublicSwap(false), 'ERR_IS_FINALIZED');
            await truffleAssert.reverts(pool.setSwapFee(toWei('0.01')), 'ERR_IS_FINALIZED');
        });
    });
});
