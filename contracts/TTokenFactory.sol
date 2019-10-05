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

import "contracts/TToken.sol";

contract TTokenFactory {
    mapping(bytes32=>TToken) tokens;
    constructor() public {
        build("DIRT");
        build("ROCK");
        build("SAND");

        get("DIRT").mint(100 ether);
        get("ROCK").mint(100 ether);
        get("SAND").mint(100 ether);

        get("DIRT").transfer(msg.sender, 100 ether);
        get("ROCK").transfer(msg.sender, 100 ether);
        get("SAND").transfer(msg.sender, 100 ether);
    }
    function get(bytes32 name) public returns (TToken) {
        return tokens[name];
    }
    function build(bytes32 name) public {
        tokens[name] = new TToken();
    }
}
