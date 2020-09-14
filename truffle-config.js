const path = require('path');

const { NearProvider } = require('near-web3-provider');

function NearLocalProvider() {
    return new NearProvider({
        nodeUrl: 'http://127.0.0.1:3030',
        networkId: 'local',
        masterAccountId: 'test.near',
        numTestAccounts: 5,
        keyPath: path.join(process.env.HOME, '.near/local/validator_key.json'),
    });
}

function NearTestNetProvider() {
    return new NearProvider({
        nodeUrl: 'http://34.82.212.1:3030',
        networkId: 'default',
        masterAccountId: '1.test.near',
        evmAccountId: 'evm',
        keyPath: path.join(__dirname, '1.test.near.json'),
    });
}

module.exports = {
    networks: {
        near: {
            network_id: "*",
            skipDryRun: true,
            provider: () => NearTestNetProvider(),
        },
        development: {
            network_id: "*",
            skipDryRun: true,
            provider: () => NearLocalProvider(),
        },
        // development: {
        //     host: 'localhost', // Localhost (default: none)
        //     port: 8545, // Standard Ethereum port (default: none)
        //     network_id: '*', // Any network (default: none)
        //     gas: 10000000,
        // },
        coverage: {
            host: 'localhost',
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        },
    },
    // Configure your compilers
    compilers: {
        solc: {
            version: '0.5.12',
            settings: { // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 100,
                },
                evmVersion: 'byzantium',
            },
        },
    },
};
