let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");

module.exports.phase0 = async (web3, admin) => {
    let env = {};
    let deploy = (w, a, t) => pkg.types.deploy(web3, admin, t);
    env.admin = admin;
    env.factory = await deploy(web3, admin, "BFactory");
    return env;
}

