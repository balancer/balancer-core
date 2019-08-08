module.exports.deployType = async function (web3, type, cb) {
    //console.log(type);
    if(type.bin == '') {
        throw new Error("Trying to deploy contract with empty `bin`");
    }
    let accounts = await web3.eth.getAccounts();
    acct0 = accounts[0];
    new web3.eth.Contract(JSON.parse(type.abi))
        .deploy({data: type.bin})
        .send({from: acct0, gas: 6000000}, (err,tx) => {
            //console.log(err, tx);
            setTimeout(() => {
                web3.eth.getTransactionReceipt(tx, (err, receipt) => {
                    //console.log(err, receipt);
                    cb(receipt.contractAddress);
                })
            }, 25);
        })
}


