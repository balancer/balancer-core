var assert = require("assert");
var Web3 = require("web3");
var ganache = require("ganache-core");

let buildout = require("../out/combined.json");
let types = buildout.contracts;
let Balancer = types["src/Balancer.sol:Balancer"];
let BalanceMath = types["src/BalanceMath.sol:BalanceMath"];
 
describe("BalanceMath", () => {

    var web3 = new Web3(ganache.provider());
    let BM = web3.eth.Contract(JSON.parse(BalanceMath.abi));
   
    BM.deploy({data: BalanceMath.bin}).send({from: "0x0"})
    .then((bm) => {;
        describe("add", () => {
            it("should return the sum of two numbers", () => {
                var c = bm.add(1, 2);
            });
            // etc
            it("should not overflow", () => {
            });
        });

        describe("mul", () => {
        });
    });
});
