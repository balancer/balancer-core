module.exports.deployTestEnv = async function(web3, buildout) {
    var objects = { // Base scenario universe
        acct0: undefined,
        math: undefined,
        bTest: undefined,
    };
    let types = buildout.contracts;
    let Balancer = types["src/Balancer.sol:Balancer"];
    let BalanceMath = types["src/BalanceMath.sol:BalanceMath"];
    let BalanceTest = types["src/BalanceTest.sol:BalanceTest"];

    objects.accts = await web3.eth.getAccounts();
    objects.acct0 = objects.accts[0];
    objects.math = await module.exports.deployType(web3, BalanceMath);
    objects.bTest = await module.exports.deployType(web3, BalanceTest);
    //console.log(objects);
    return objects;
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


