const TTokenFactory = artifacts.require('TTokenFactory');
const TMath = artifacts.require('TMath');
const BFactory = artifacts.require('BFactory');

module.exports = async function (deployer, network, accounts) {
    if (network === 'development' || network === 'coverage') {
        deployer.deploy(TTokenFactory);
        deployer.deploy(TMath);
    }
    deployer.deploy(BFactory);
};
