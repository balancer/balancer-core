module.exports = async function(web3, from, typeName, args) {
    // TODO very fragile, dependencies expect this bound properly
    let type = this.types.types[typeName];
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

