module.exports.deployTestEnv = async function(web3, buildout) {
    var env = { // Base scenario universe
        acct0: undefined,
        math: undefined,
        bTest: undefined,
        types: buildout.contracts
    };
    let Balancer = env.types["src/Balancer.sol:Balancer"];
    let BalanceMath = env.types["src/BalanceMath.sol:BalanceMath"];
    let BalanceTest = env.types["src/BalanceTest.sol:BalanceTest"];

    env.accts = await web3.eth.getAccounts();
    env.acct0 = env.accts[0];
    env.math = await module.exports.deployType(web3, BalanceMath);
    env.bTest = await module.exports.deployType(web3, BalanceTest);
    return env;
}

module.exports.deployType = async function (web3, type) {
    //console.log(type);
    if(type.bin == '') {
        throw new Error("Trying to deploy contract with empty `bin`");
    }
    let accounts = await web3.eth.getAccounts();
    acct0 = accounts[0];
    return new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin})
            .send({from: acct0, gas: 0xfffffff});
}
