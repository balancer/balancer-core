// All test points have been calculated with Wolfram Mathematica. See here: https://www.wolframcloud.com/obj/fernando.martinel/Published/test_extreme_weights.nb

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const MaxError = 10**-8;
const swapFee = 0.001; //0.001;
const exitFee = 0.0001; //0.01;
const verbose = false;

function calcRelativeDiff(_expected, _actual) {
  return Math.abs((_expected - _actual)/_expected);
}

contract('math tests from canonical setup', async (accounts) => {
  const admin = accounts[0];
  const toHex = web3.utils.toHex;
  const toBN = web3.utils.toBN;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;

  const MAX = web3.utils.toTwosComplement(-1);

  let tokens;           // token factory / registry
  let DIRT, ROCK, SAND; // addresses
  let dirt, rock, sand; // TTokens
  let factory;          // BPool factory
  let pool;             // first pool w/ defaults
  let POOL;             //   pool address

  const dirtBalance = toWei('1000');
  let currentDirtBalance = parseInt(dirtBalance)/10**18;
  let previousDirtBalance = currentDirtBalance;
  const dirtDenorm = toWei('1');

  const rockBalance = toWei('1000');
  let currentRockBalance = parseInt(rockBalance)/10**18;;
  let previousRockBalance = currentRockBalance;
  const rockDenorm = toWei('49');

  let currentPoolBalance = 0;
  let previousPoolBalance = 0;

  const sumWeigths = parseInt(dirtDenorm)+parseInt(rockDenorm);
  const dirtNorm = parseInt(dirtDenorm)/sumWeigths;
  const rockNorm = parseInt(rockDenorm)/sumWeigths;

  async function logAndAssertCurrentBalances(){
    
    let expected = currentPoolBalance*10**18;
    let actual = await pool.totalSupply.call();
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Pool Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    expected = currentDirtBalance*10**18; 
    actual = await pool.getBalance.call(DIRT);
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Dirt Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    expected = currentRockBalance*10**18; 
    actual = await pool.getBalance.call(ROCK);
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Rock Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true);
  }

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);
    console.log(`pool := factory.newBPool()`);

    await tokens.build(toHex("DIRT"));
    DIRT = await tokens.get.call(toHex("DIRT"));
    dirt = await TToken.at(DIRT);
    console.log(`dirt := tokens.build('DIRT')`);

    await tokens.build(toHex("ROCK"));
    ROCK = await tokens.get.call(toHex("ROCK"));
    rock = await TToken.at(ROCK);
    console.log(`rock := tokens.build('ROCK')`);

    await dirt.mint(MAX);
    console.log("dirt.mint(MAX);");
    await dirt.approve(POOL, MAX);
    console.log("dirt.approve(POOL, MAX);");

    await rock.mint(MAX);
    console.log("rock.mint(MAX);");
    await rock.approve(POOL, MAX);
    console.log("rock.approve(POOL, MAX);");

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.bind(DIRT, ${dirtBalance}, ${dirtDenorm})`);

    await pool.bind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.bind(ROCK, ${rockBalance}, ${rockDenorm})`);

    await pool.setPublicSwap(true);
    console.log('pool.setPublicSwap(true);');
    await pool.setPublicJoin(true);
    console.log('pool.setPublicJoin(true);');
    await pool.setSwapFee(String(swapFee*10**18));
    console.log('setSwapFee(swapFee');
  });

  beforeEach(async () => {
    //await pool.rebind(DIRT, dirtBalance, dirtDenorm);
    //console.log(`pool.rebind(DIRT, ${dirtBalance}, ${dirtDenorm})`);
    //await pool.rebind(ROCK, rockBalance, rockDenorm);
    //console.log(`pool.rebind(ROCK, ${rockBalance}, ${rockDenorm})`);
  });

  // TODO: swap parameters of all asserts -> correct order is (actual, expected)

  it('swap_ExactAmountIn', async () => {
    //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactAmountIn`, 
                    [DIRT, toWei('500'), ROCK, '0', MAX],  
                    [toWei(`8.23390841016124456`),toWei(`74.1844011380065814`)], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    let output = await pool.swap_ExactAmountIn.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[0]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[1]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    } 
    assert.equal(relDif<MaxError, true); 
  });


  it('swap_ExactAmountOut', async () => {
        //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactAmountOut`, 
                    [DIRT, MAX, ROCK, toWei('333.333333333333333333'), MAX],  
                    [toWei(`425506505648.348073`),toWei(`31306034272.9265099`)], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    let output = await pool.swap_ExactAmountOut.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[0]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[1]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    } 
    assert.equal(relDif<MaxError, true); 
  });

  it('swap_ExactMarginalPrice'); /*, async () => {
    //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactMarginalPrice`, 
                    [DIRT, MAX, ROCK, '0', toWei(`74.1107209737620806`)], //
                    [toWei(`500`),toWei(`8.24065622001300310`)], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    console.log(test[0]);
    let output = await pool.swap_ExactMarginalPrice.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[0]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`output[1]`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }  
    assert.equal(relDif<MaxError, true); 
  }); */

  it('joinPool', async () => {

    currentPoolBalance = 100;
    await pool.finalize(toWei(String(currentPoolBalance)));

    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let pAo = 1;
    console.log(`pAo: ${pAo})`);        
    await pool.joinPool(toWei(String(pAo)));

    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance += pAo; 
    // Balances of all tokens increase proportionally to the pool balance
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance += pAo/previousPoolBalance * previousDirtBalance; 
    previousRockBalance = currentRockBalance;
    currentRockBalance += pAo/previousPoolBalance * previousRockBalance; 

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances();        
  });

  it('exitPool', async () => {
    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let pAi = 1/(1-exitFee); // so that the balances of all tokens will go back exactly to what they were before joinPool()
    let pAiAfterExitFee = pAi*(1-exitFee)

    await pool.exitPool(toWei(String(pAi)));

    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance -= pAiAfterExitFee; 
    // Balances of all tokens increase proportionally to the pool balance
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance -= pAiAfterExitFee/previousPoolBalance * previousDirtBalance; 
    previousRockBalance = currentRockBalance;
    currentRockBalance -= pAiAfterExitFee/previousPoolBalance * previousRockBalance; 

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances();    
  });


  it('joinswap_ExternAmountIn', async () => {
    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let tokenRatio = 1.1;
    let tAi = 1/(1-swapFee*(1-dirtNorm))*currentDirtBalance*(tokenRatio-1); // increase tbalance by 1.1 after swap fee
    let pAo = await pool.joinswap_ExternAmountIn(DIRT, toWei(String(tAi))); 

    //// Update balance states
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance += tAi;
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance *= tokenRatio**dirtNorm; // increase by 1.1**dirtNorm

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances(); 
  });


  it('joinswap_PoolAmountOut', async () => {
    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatio = 1.1;
    let pAo = currentPoolBalance*(poolRatio-1);
    let tAi = await pool.joinswap_PoolAmountOut(toWei(String(pAo)), ROCK); // 10% of current supply
    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance *= poolRatio; // increase by 1.1
    previousRockBalance = currentRockBalance;
    currentRockBalance += previousRockBalance*(poolRatio**(1/rockNorm)-1)*1/(1-swapFee*(1-rockNorm)); // (21% + swap fees) addition to current Rock supply ;

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances(); 
  });


  it('exitswap_PoolAmountIn', async () => {
    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatioAfterExitFee = 0.9;
    let pAi = currentPoolBalance * (1-poolRatioAfterExitFee)*(1/(1-exitFee));
    let tAo = await pool.exitswap_PoolAmountIn(toWei(String(pAi)),DIRT);

    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance -= pAi*(1-exitFee); 
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance -= previousDirtBalance*(1-poolRatioAfterExitFee**(1/dirtNorm))*(1-swapFee*(1-dirtNorm));

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances();
  });


  it('exitswap_ExternAmountOut', async () => {
    //// Print current balances prior to operation
    if(verbose){
        console.log(`BEFORE`);
    }
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatioAfterExitFee = 0.9;
    let tokenRatioBeforeSwapFee = poolRatioAfterExitFee**(1/rockNorm);
    let tAo = currentRockBalance * (1-tokenRatioBeforeSwapFee)*(1-swapFee*(1-rockNorm));
    let pAi = await pool.exitswap_ExternAmountOut(ROCK, toWei(String(tAo)));
    //// Update balance states
    previousRockBalance = currentRockBalance;
    currentRockBalance -= tAo
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance -= previousPoolBalance*(1-poolRatioAfterExitFee);

    //// Print current balances prior to operation
    if(verbose){
        console.log(`AFTER`);
    }
    await logAndAssertCurrentBalances();
  });

  it('pAo = joinswap_ExternAmountIn(joinswap_PoolAmountOut(pAo))', async () => {
    //// Print current balances prior to operation
    let pAo = 0.1;
    let tAi = await pool.joinswap_PoolAmountOut.call(toWei(String(pAo)),DIRT);
    let calculatedPAo = await pool.joinswap_ExternAmountIn.call(DIRT, String(tAi)); // NO toWei since tAo is already in wei
    
    let expected = pAo*10**18;
    let actual = calculatedPAo;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`tAi: ${tAi})`);
        console.log(`pAo`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 
  });


  it('tAi = joinswap_PoolAmountOut(joinswap_ExternAmountIn(tAi))', async () => {
    //// Print current balances prior to operation
    let tAi = 1;
    let pAo = await pool.joinswap_ExternAmountIn.call(ROCK, toWei(String(tAi)));
    let calculatedtAi = await pool.joinswap_PoolAmountOut.call(String(pAo), ROCK); // NO toWei since pAi is already in wei
    
    let expected = tAi*10**18;
    let actual = calculatedtAi;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`pAo: ${pAo})`);
        console.log(`tAi`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 
  });


  it('pAi = exitswap_ExternAmountOut(exitswap_PoolAmountIn(pAi))', async () => {
    //// Print current balances prior to operation
    let pAi = 0.1;
    let tAo = await pool.exitswap_PoolAmountIn.call(toWei(String(pAi)),DIRT);
    let calculatedPAi = await pool.exitswap_ExternAmountOut.call(DIRT, String(tAo)); // NO toWei since tAo is already in wei
    
    let expected = pAi*10**18;
    let actual = calculatedPAi;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`tAo: ${tAo})`);
        console.log(`pAi`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 
  });


  it('tAo = exitswap_PoolAmountIn(exitswap_ExternAmountOut(tAo))', async () => {
    //// Print current balances prior to operation
    let tAo = 1;
    let pAi = await pool.exitswap_ExternAmountOut.call(ROCK, toWei(String(tAo)));
    let calculatedtAo = await pool.exitswap_PoolAmountIn.call(String(pAi), ROCK); // NO toWei since pAi is already in wei
    
    let expected = tAo*10**18;
    let actual = calculatedtAo;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`pAi: ${pAi})`);
        console.log(`tAo`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 
  });
});
