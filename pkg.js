module.exports.floatMath = require("./util/floatMath.js");

let buildout = require("./evm/combined.json");
let types = buildout.contracts;
function lift(type) {
    types[type] = types[`sol/${type}.sol:${type}`];
    types[`sol/${type}.sol:${type}`] = undefined;
}
lift("BalancerMath");
lift("BalancerPool");
lift("BToken");
module.exports.types = types;

module.exports.deploy = async function(web3, from, typeName, args) {
    let type = types[typeName];
    if(type == undefined) {
        throw new Error(`Trying to deploy ${typeName}, but type name not recognized`);
    }
    if(type.bin == '') {
        throw new Error(`Trying to deploy contract ${typeName} with empty \`bin\``);
    }
    return new web3.eth.Contract(JSON.parse(type.abi))
            .deploy({data: type.bin, arguments: args})
            .send({from: from, gas: 0xfffffff});
}

