const BToken = artifacts.require('BToken');
const truffleAssert = require('truffle-assertions');

contract('BToken', async (accounts) => {
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const { toWei, fromWei } = web3.utils;

    describe('ERC20 BPTs', () => {
        let btoken;

        before(async () => {
            btoken = await BToken.deployed();
        });

        it('Token descriptors', async () => {
            const name = await btoken.name();
            assert.equal(name, 'Balancer Pool Token');

            const symbol = await btoken.symbol();
            assert.equal(symbol, 'BPT');

            const decimals = await btoken.decimals();
            assert.equal(decimals, 18);
        });

        it('Token allowances', async () => {
            await btoken.approve(user1, toWei('50'));
            let allowance = await btoken.allowance(admin, user1); 
            assert.equal(fromWei(allowance), 50);

            await btoken.increaseApproval(user1, toWei('50'));
            allowance = await btoken.allowance(admin, user1);
            assert.equal(fromWei(allowance), 100);

            await btoken.decreaseApproval(user1, toWei('50'));
            allowance = await btoken.allowance(admin, user1);
            assert.equal(fromWei(allowance), 50);

            await btoken.decreaseApproval(user1, toWei('100'));
            allowance = await btoken.allowance(admin, user1);
            assert.equal(fromWei(allowance), 0);
        });

        // it('Admin balance', async () => {
        //     let balance = await btoken.balanceOf(admin);
        //     console.log(balance)
        //     // assert.equal(name, 'Balancer Pool Token');
        // });
    });
});
