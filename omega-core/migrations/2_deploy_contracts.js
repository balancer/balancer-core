const OFactory = artifacts.require("OFactory.sol");

module.exports = function(deployer, network, addresses) {
  deployer.deploy(OFactory, addresses[0]);
};
