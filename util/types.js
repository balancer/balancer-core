// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

let buildout = require("../out/combined.json");
var types = buildout.contracts;

function liftAll() {
    function lift(type) {
        types[type] = types[`sol/${type}.sol:${type}`];
    }

    lift("BCoin");
    lift("BConst");
    lift("BError");
    lift("BEvent");
    lift("BFactory");
    lift("BMath");
    lift("BNote");
    lift("BNum");
    lift("BPool");
    lift("TToken");
}

liftAll();

module.exports.reloadTypes = function(path) {
    let buildout = require(path);
    types = buildout.contracts;
    liftAll();
}

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

// accts[0] will be the admin
// any remaining accounts will get an initial balance and approve the bpool
// if accts is empty or undefined, getAccounts()[0,1,2] will be used
module.exports.deployTestScenario = async function(web3, accts, log) {
    if (!log) log = () => {}
    var env = {};
    if (!accts || accts.length == 0) {
        accts = await web3.eth.getAccounts();
        accts = accts.slice(0, 3);
    }
    let admin = accts[0];

    env.accts = accts;
    env.admin = admin;

    env.factory = await this.deploy(web3, admin, "BFactory");
    log(`factory ${env.factory._address} = deploy BFactory`);

    let poolAddress = await env.factory.methods.new_BPool().call();
    await env.factory.methods.new_BPool().send({from: env.admin, gas: 0xffffffff});
    env.pool = new web3.eth.Contract(JSON.parse(this.types.BPool.abi), poolAddress);
    log(`pool ${env.pool._address} = factory.new_BPool()`);

    env.acoin = await this.deploy(web3, admin, "TToken", [web3.utils.toHex("A")]);
    log(`${env.acoin._address} = deploy TToken`);
    env.bcoin = await this.deploy(web3, admin, "TToken", [web3.utils.toHex("B")]);
    log(`${env.bcoin._address} = deploy TToken`);
    env.ccoin = await this.deploy(web3, admin, "TToken", [web3.utils.toHex("C")]);
    log(`${env.ccoin._address} = deploy TToken`);

    let toWei = web3.utils.toWei;

    for (let coin of [env.acoin, env.bcoin, env.ccoin]) {
        log(`for coin: ${coin._address}`);
        for (let acct of accts) {
            log(`  for acct: ${acct}`);
            let amt = toWei('10000');
            await coin.methods.mint(amt).send({from: admin});
            log(`    mint ${amt}`);
            await coin.methods.transfer(acct, amt).send({from: admin});
            log(`    xfer to ${acct}`);
            await coin.methods.approve(env.pool._address, web3.utils.toTwosComplement('-1'))
                      .send({from: acct});
            log(`    approve pool by ${acct}`);
        }
        await coin.methods.mint(toWei('100'));
        log(`  mint token for pool`);
        await env.pool.methods.bind(coin._address, toWei('1'), toWei('1'))
                      .send({from: admin, gas: 0xffffffff});
        log(`  bind token to pool...`);
        let balance = toWei('10');
        let weight = toWei('10');
        await env.pool.methods.setParams(coin._address, weight, balance)
                      .send({from: admin, gas: 0xffffffff});
        log(`  setting params: weight: ${weight} , balance: ${balance}`); 
    }

    await env.pool.methods.start().send({from: admin});
    log(`pool.start()`);
    
    return env;
}
