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

module.exports.liftTypes = function (types) {
  function lift (type) {
    module.exports[type] = types[`sol/${type}.sol:${type}`]
  }

  lift('BFactory')
  lift('BPool')
  lift('BStub')
  lift('TToken')
}

module.exports.loadTestTypes = function () {
  const testPath = '../out/tmp/combined.json'
  const buildout = require(testPath)
  module.exports.liftTypes(buildout.contracts)
}

const dist = require('../out/combined.json')
module.exports.liftTypes(dist.contracts)
