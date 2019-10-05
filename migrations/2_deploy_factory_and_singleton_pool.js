const TTokenFactory = artifacts.require("TTokenFactory");
const BFactory = artifacts.require("BFactory");
const BPool = artifacts.require("BPool");

module.exports = function(deployer) {
    deployer.deploy(TTokenFactory);
    deployer.deploy(BFactory);
    deployer.deploy(BPool); // singleton for testing
}
