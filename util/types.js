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
let tmpout = require("../tmp/combined.json");
let types = buildout.contracts;
if (tmpout != {}) {
    console.log("TMP TMP ");
    types = tmpout.contracts;
}

function lift(type) {
    types[type] = types[`sol/${type}.sol:${type}`];
    types[`sol/${type}.sol:${type}`] = undefined;
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

// accts[0] will be the admin
// any remaining accounts will get an initial balance and approve the bpool
// if accts is empty or undefined, getAccounts() will be used
module.exports.deployTestScenario = async function(web3, accts) {
    var env = {};
    if (!accts || accts.length == 0) {
        accts = await web3.eth.getAccounts();
    }
    let admin = accts[0];

    env.acoin = await this.deploy(web3, admin, "BToken", [web3.utils.toHex("A")]);
    env.bcoin = await this.deploy(web3, admin, "BToken", [web3.utils.toHex("B")]);
    env.ccoin = await this.deploy(web3, admin, "BToken", [web3.utils.toHex("C")]);

    env.pool = await this.deploy(web3, admin, "BPool");
}
