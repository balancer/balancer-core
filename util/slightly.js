const Web3 = require('web3');

const toBN = Web3.utils.toBN
const toWei = Web3.utils.toWei
const fromWei = Web3.utils.fromWei

const TOLERANCE = '0.000000001'

// slightly gte (bignum)
module.exports.sgte = (a, b, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = Web3.utils.toBN(Web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    errstr = `assert.sgte(${fromWei(a)}, ${fromWei(b)}, (tolerance=${fromWei(tolerance)}))`;
    let diff = a.sub(b);
    assert( diff.cmp(0) >= 0, errstr );
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}
// slightly lte (bignum)
module.exports.slte = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = Web3.utils.toBN(Web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    errstr = `assert.slte(${a}, ${b}, (tolerance=${tolerance}))`;
    let diff = a.sub(b);
    assert( diff.cmp(toBN('0')) <= 0, errstr );
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}

module.exports.approx = (a, b, errstr, tolerance) => { 
    if( tolerance == undefined) {
        tolerance = Web3.utils.toBN(Web3.utils.toWei(TOLERANCE))
    }
    if(typeof(a) == 'string') {
        a = Web3.utils.toBN(a);
    }
    if(typeof(b) == 'string') {
        b = Web3.utils.toBN(b);
    }
    errstr = `assert.approx(${a}, ${b}, (tolerance=${tolerance}))`;
    let diff = a.sub(b);
    let scaleA = a.mul(tolerance).div(toBN(toWei('1')));
    assert( diff.abs().cmp(scaleA) <= 0, errstr );
}


