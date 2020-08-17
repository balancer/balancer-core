const web3 = require('web3');
const { NearProvider, nearlib, utils } = require('near-web3-provider');

const NEAR_LOCAL_NETWORK_ID = 'local';
const NEAR_LOCAL_URL = 'http://127.0.0.1:3030';

const keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore('neardev');
const NEAR_LOCAL_ACCOUNT_ID = 'test.near';
const NEAR_LOCAL_EVM = 'evm.test.near';
const NEAR_LOCAL_EVM_ACCOUNT_ID = utils.nearAccountToEvmAddress(NEAR_LOCAL_ACCOUNT_ID);
const LOTS_OF_GAS = "0xffffffffffffffffff";

module.exports = {
    networks: {
        development: {
            network_id: "*",
            skipDryRun: true,
            from: NEAR_LOCAL_EVM_ACCOUNT_ID,
            gas: LOTS_OF_GAS,
            provider: () => {
                const provider = new NearProvider(
                    NEAR_LOCAL_URL, keyStore, NEAR_LOCAL_ACCOUNT_ID,
                    NEAR_LOCAL_NETWORK_ID, NEAR_LOCAL_EVM,
                );
                utils.createTestAccounts(provider, 5);
                return provider;
            },
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
