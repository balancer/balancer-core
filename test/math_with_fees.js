const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const MaxError = 10**-9;
const swapFee = 0.001;
const exitFee = 0.01;

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

  const dirtBalance = toWei('4');
  let currentDirtBalance = parseInt(dirtBalance)/10**18;
  let previousDirtBalance = currentDirtBalance;
  const dirtDenorm = toWei('10');

  const rockBalance = toWei('12');
  let currentRockBalance = parseInt(rockBalance)/10**18;;
  let previousRockBalance = currentRockBalance;
  const rockDenorm = toWei('10');

  let currentPoolBalance = 0;
  let previousPoolBalance = 0;

  const sumWeigths = parseInt(dirtDenorm)+parseInt(rockDenorm);
  const dirtNorm = parseInt(dirtDenorm)/sumWeigths;
  const rockNorm = parseInt(rockDenorm)/sumWeigths;

  async function logAndAssertCurrentBalances(){
    
    let expected = currentPoolBalance*10**18;
    let actual = await pool.totalSupply.call();
    let relDif = calcRelativeDiff(expected,actual);
    console.log(`Pool Balance`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);

    assert.equal(relDif<MaxError, true); 

    expected = currentDirtBalance*10**18; 
    actual = await pool.getBalance.call(DIRT);
    relDif = calcRelativeDiff(expected,actual);    
    console.log(`Dirt Balance`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);

    assert.equal(relDif<MaxError, true); 

    expected = currentRockBalance*10**18; 
    actual = await pool.getBalance.call(ROCK);
    relDif = calcRelativeDiff(expected,actual);    
    console.log(`Rock Balance`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);

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
    await pool.setFees(String(swapFee*10**18),String(exitFee*10**18));
    console.log('setFees(swapFee,exitFee)');
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
                    [DIRT, toWei('2'), ROCK, '0', MAX],  
                    [toWei(String(12-48/(4+2*(1-swapFee)))),toWei(String(1/(1-swapFee)*(4+2)/(48/(4+2*(1-swapFee)))))], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    console.log(test[0]);
    let output = await pool.swap_ExactAmountIn.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    console.log(`output[0]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    console.log(`output[1]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true); 
  });


  it('swap_ExactAmountOut', async () => {
        //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactAmountOut`, 
                    [ROCK, MAX, DIRT, toWei('1'), MAX],  
                    [toWei(String((48/(4-1)-12)/(1-swapFee))),toWei(String(1/(1-swapFee)*(12+((48/(4-1)-12)/(1-swapFee)))/(4-1)))], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    console.log(test[0]);
    let output = await pool.swap_ExactAmountOut.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    console.log(`output[0]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    console.log(`output[1]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true); 
  });

  it('swap_ExactMarginalPrice'); /*, async () => {
    /* //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactMarginalPrice`, 
                    [DIRT, MAX, ROCK, '0', toWei(String(0.48))], // This price happens when Bdirt = 4.8+fee and Brock = 10 
                    [toWei(String((48/10-4))),toWei(String(12-10))], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    console.log(test[0]);
    let output = await pool.swap_ExactMarginalPrice.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = output[0];
    let relDif = calcRelativeDiff(expected,actual);
    console.log(`output[0]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = output[1];
    relDif = calcRelativeDiff(expected,actual);
    console.log(`output[1]`);
    console.log(`expected: ${expected})`);
    console.log(`actual  : ${actual})`);
    console.log(`relDif  : ${relDif})`);  
    assert.equal(relDif<MaxError, true); 
  });*/

  it('joinPool', async () => {
    console.log(`joinPool`);
    currentPoolBalance = 100;
    await pool.finalize(toWei(String(currentPoolBalance)));

    //// Print current balances prior to operation
    console.log(`BEFORE`);
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
    console.log(`AFTER`);
    await logAndAssertCurrentBalances();        
  });

  it('exitPool', async () => {
    console.log(`exitPool`);
    //// Print current balances prior to operation
    console.log(`BEFORE`);
    await logAndAssertCurrentBalances();

    //// Call function 
    let pAi = 1/(1-exitFee); // so that the balances of all tokens will go back exactly to what they were before joinPool()
    let pAiAfterExitFee = pAi*(1-exitFee)
    console.log(`pAi: ${pAi})`);
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
    console.log(`AFTER`);
    await logAndAssertCurrentBalances();    
  });


  it('joinswap_ExternAmountIn', async () => {
    console.log(`joinswap_ExternAmountIn`);
    //// Print current balances prior to operation
    console.log(`BEFORE`);
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatio = 1.1;
    let tAi = 1/(1-swapFee*(1-dirtNorm))*currentDirtBalance*(poolRatio**2-1); // increase tbalance by 1.1^2 after swap fee
    console.log(`tAi: ${tAi})`);
    let pAo = await pool.joinswap_ExternAmountIn(DIRT, toWei(String(tAi))); 

    //// Update balance states
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance += tAi;
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance *= poolRatio; // increase by 1.1

    //// Print current balances prior to operation
    console.log(`AFTER`);
    await logAndAssertCurrentBalances(); 
  });


  it('joinswap_PoolAmountOut', async () => {
    console.log(`joinswap_PoolAmountOut`);
    //// Print current balances prior to operation
    console.log(`BEFORE`);
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatio = 1.1;
    let pAo = currentPoolBalance*(poolRatio-1);
    console.log(`pAo: ${pAo})`);
    let tAi = await pool.joinswap_PoolAmountOut(toWei(String(pAo)), ROCK); // 10% of current supply
    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance *= poolRatio; // increase by 1.1
    previousRockBalance = currentRockBalance;
    currentRockBalance += previousRockBalance*(poolRatio**2-1)*1/(1-swapFee*(1-rockNorm)); // (21% + swap fees) addition to current Rock supply ;

    //// Print current balances prior to operation
    console.log(`AFTER`);
    await logAndAssertCurrentBalances(); 
  });


  it('exitswap_PoolAmountIn', async () => {
    console.log(`exitswap_PoolAmountIn`);
    //// Print current balances prior to operation
    console.log(`BEFORE`);
    await logAndAssertCurrentBalances();

    //// Call function 
    let poolRatioAfterExitFee = 0.9;
    let pAi = currentPoolBalance * (1-poolRatioAfterExitFee)*(1/(1-exitFee));;    
    console.log(`pAi: ${pAi})`);
    let tAo = await pool.exitswap_PoolAmountIn(toWei(String(pAi)),DIRT);

    //// Update balance states
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance -= pAi*(1-exitFee); 
    previousDirtBalance = currentDirtBalance;
    currentDirtBalance -= previousDirtBalance*(1-poolRatioAfterExitFee**2)*(1-swapFee*(1-dirtNorm));

    //// Print current balances prior to operation
    console.log(`AFTER`);
    await logAndAssertCurrentBalances();
  });


  it('exitswap_ExternAmountOut', async () => {
    console.log(`exitswap_ExternAmountOut`);
    //// Print current balances prior to operation
    console.log(`BEFORE`);
    await logAndAssertCurrentBalances();

    //// Call function 
    let tokenRatioBeforeSwapFee = 0.9**2;
    let tAo = currentRockBalance * (1-tokenRatioBeforeSwapFee)*(1-swapFee*(1-rockNorm));
    console.log(`tAo: ${tAo})`);
    let pAi = await pool.exitswap_ExternAmountOut(ROCK, toWei(String(tAo)));
    //// Update balance states
    previousRockBalance = currentRockBalance;
    currentRockBalance -= tAo
    previousPoolBalance = currentPoolBalance;
    currentPoolBalance -= previousPoolBalance*(1-tokenRatioBeforeSwapFee**0.5);

    //// Print current balances prior to operation
    console.log(`AFTER`);
    await logAndAssertCurrentBalances();
  });

  it('pAi = exitswap_ExternAmountOut(exitswap_PoolAmountIn(pAi))');
  it('tAo = exitswap_PoolAmountIn(exitswap_ExternAmountOut(tAo))');
});
