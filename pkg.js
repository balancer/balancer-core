let buildout = require("./evm/combined.json");

let types = buildout.contracts;

function lift(type) {
    console.log(`lifting ${type}`);
    types[type] = types[`src/${type}.sol:${type}`];
    types[`src/${type}.sol:${type}`] = undefined;
}

lift("BalancerPool");
lift("BalancerMath");
lift("BToken");

module.exports.deploy = async function(web3, from, typeName, args) {
    let type = types[typeName];
    if(type.bin == '') {
        throw new Error("Trying to deploy contract with empty `bin`");
    }
    return new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin, arguments: args})
            .send({from: from, gas: 0xfffffff});
}

module.exports.types = types;
module.exports.floatMath = require("./src/floatMath.js");
