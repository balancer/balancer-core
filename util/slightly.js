const Web3 = require('web3');

const toBN = Web3.utils.toBN
const toWei = Web3.utils.toWei
const fromWei = Web3.utils.fromWei

const TOLERANCE = toBN(toWei('0.000000001'))

// slightly gte (bignum)
module.exports.sgte = (a, b, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = TOLERANCE;
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    let diff = a.sub(b);
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    return diff.cmp(0) >= 0 && diff.abs().cmp(scaleA) <= 0;
}
// slightly lte (bignum)
module.exports.slte = (a, b, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = TOLERANCE;
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    let diff = a.sub(b);
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    return diff.cmp(toBN('0')) <= 0 && diff.abs().cmp(scaleA) <= 0;
}

module.exports.approx = (a, b, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = TOLERANCE;
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    let diff = a.sub(b);
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    return diff.abs().cmp(scaleA) <= 0;
}


