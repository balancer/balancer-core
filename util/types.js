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
let types = buildout.contracts;

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

