module.exports = {
  port: 8555,
  skipFiles: [
    'BStub.sol',
    'Migrations.sol',
    'TToken.sol',
    'TTokenFactory.sol'
  ],
  testrpcOptions: "-p 8555 -d --allowUnlimitedContractSize"
};