let buildout = require("./evm/combined.json");

let types = buildout.contracts;

types.BalancerPool = types["src/BalancerPool.sol:BalancerPool"];
types.BalancerMath = types["src/BalancerMath.sol:BalancerMath"];

types["src/BalancerPool.sol:BalancerPool"] = undefined;
types["src/BalancerMath.sol:BalancerMath"] = undefined;

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
module.exports.floatMath = require("./src/floatMath.js");
