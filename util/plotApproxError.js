let fMath = require("./floatMath.js").floatMath;
let assert = require("chai").assert;

/*
console.log("\"x\", \"y\", \"value\"");
for( let i = 0; i < 2; i += 0.1 ) {
    for( let j = 0; j < 1; j += 0.1 ) {
        let err = fMath.powApprox(i, j) - Math.pow(i, j);
        console.log(i + ",", + j + "," + err);
    }
}
*/
console.log("\"x\", \"value\"");
for( let i = 0; i < 2; i += 0.01 ) {
    let max = 0;
    for( let j = 0; j < 1; j += 0.01 ) {
        let err = fMath.powApprox(i, j) - Math.pow(i, j);
        if( Math.abs(err) > max ) max = err;
    }
    console.log(i + "," +  max);
}
