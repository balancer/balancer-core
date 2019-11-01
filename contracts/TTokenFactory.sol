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

pragma solidity ^0.5.11;

import "./TToken.sol";

contract TTokenFactory {
    mapping(bytes32=>TToken) tokens;
    function get(bytes32 name) public returns (TToken) {
        return tokens[name];
    }
    function build(bytes32 name) public returns (TToken) {
        tokens[name] = new TToken();
        return tokens[name];
    }
}
