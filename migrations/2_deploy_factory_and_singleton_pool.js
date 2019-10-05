const BFactory = artifacts.require("BFactory");
const BPool = artifacts.require("BPool");

module.exports = function(deployer) {
    deployer.deploy(BFactory);
    deployer.deploy(BPool); // singleton for testing
}
