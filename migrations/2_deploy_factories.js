const TTokenFactory = artifacts.require("TTokenFactory");
const BFactory = artifacts.require("BFactory");

module.exports = function(deployer) {
    deployer.deploy(TTokenFactory);
    deployer.deploy(BFactory);
}
