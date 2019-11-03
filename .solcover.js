module.exports = {
  port: 8555,
  skipFiles: [
    'BStub.sol',
    'Migrations.sol',
    'test'
  ],
  testrpcOptions: "-p 8555 -d --allowUnlimitedContractSize"
};