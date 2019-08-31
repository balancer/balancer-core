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
/*
console.log("\"base\", \"res\"");
for( let iter = 0; iter < 100; iter++) {
    let max = 0;
    for( let i = 0.5; i < 1.5; i += 0.01 ) {
        for( let j = 0; j < 1; j += 0.01 ) {
            let err = fMath.powApprox(i, j, iter) - Math.pow(i, j);
            if( Math.abs(err) > max ) max = err;
        }
    }
    console.log(iter + "," +  max);
}
*/
let errlimit = Math.pow(10, -6);
console.log("\"base\", \"res\"");
for( let bound = 0; bound < 0.5; bound += 0.01 ) {
    let found = false;
    for( let iter = 0; iter < 1000; iter += 2) {

        let max = 0;
        for( let i = bound; i <= 2 - bound; i += 0.01 ) {
            for( let j = 0; j < 1; j += 0.01 ) {
                let err = fMath.powApprox(i, j, iter) - Math.pow(i, j);
                if( Math.abs(err) > max ) max = err;
            }
        }
        if( max < errlimit ) {
            console.log(bound + "," + iter);
            found = true;
            break;
        }
    }
    if( !found ) {
        console.log(bound + ", NONE");
    }
}
