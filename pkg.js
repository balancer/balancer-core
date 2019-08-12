let buildout = require("./evm/combined.json");

let types = buildout.contracts;

types.Balancer = types["src/Balancer.sol:Balancer"];
types.BalanceMath = types["src/BalanceMath.sol:BalanceMath"];
types.BalanceTest = types["src/BalanceTest.sol:BalanceTest"];

/*
delete types["src/Balancer.sol:Balancer"];
delete types["src/BalanceMath.sol:BalanceMath"];
delete types["src/BalanceTest.sol:BalanceTest"];
*/

module.exports.deploy = async function(web3, from, typeName) {
    //console.log(type);
    let type = types[typeName];
    if(type.bin == '') {
        throw new Error("Trying to deploy contract with empty `bin`");
    }
    return new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin})
            .send({from: from, gas: 0xfffffff});
}

module.exports.types = types;
