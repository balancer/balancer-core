// All test points have been calculated with Wolfram Mathematica. See here: https://www.wolframcloud.com/obj/fernando.martinel/Published/test_extreme_weights.nb

const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const errorDelta = 10**-8;
const swapFee = 0.001; //0.001;
const exitFee = 0.0001; //0.01;
const verbose = process.env.VERBOSE;

function calcRelativeDiff(_expected, _actual) {
  return Math.abs((_expected - _actual)/_expected);
}

contract('BPool', async (accounts) => {
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

  const sumWeights = parseInt(dirtDenorm)+parseInt(rockDenorm);
  const dirtNorm = parseInt(dirtDenorm)/sumWeights;
  const rockNorm = parseInt(rockDenorm)/sumWeights;

  async function logAndAssertCurrentBalances(){
    
    let expected = currentPoolBalance*10**18;
    let actual = await pool.totalSupply();
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Pool Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.isAtMost(relDif, errorDelta); 

    expected = currentDirtBalance*10**18; 
    actual = await pool.getBalance(DIRT);
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Dirt Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.isAtMost(relDif, errorDelta); 

    expected = currentRockBalance*10**18; 
    actual = await pool.getBalance(ROCK);
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Rock Balance`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.isAtMost(relDif, errorDelta);
  }

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call(); // this works fine in clean room
    await factory.newBPool();
    pool = await BPool.at(POOL);


    await tokens.build(toHex("DIRT"));
    await tokens.build(toHex("ROCK"));

    DIRT = await tokens.get(toHex("DIRT"));
    ROCK = await tokens.get(toHex("ROCK"));


    dirt = await TToken.at(DIRT);
    rock = await TToken.at(ROCK);

    await dirt.mint(MAX);
    await rock.mint(MAX);

    await dirt.approve(POOL, MAX);
    await rock.approve(POOL, MAX);


    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    await pool.bind(ROCK, rockBalance, rockDenorm);

    await pool.setPublicSwap(true);
   
    await pool.setSwapFee(toWei(String(swapFee)));
  });

  describe('Extreme weights', () => {

    // TODO: swap parameters of all asserts -> correct order is (actual, expected)

    it('swap_ExactAmountIn', async () => {
      
      let tokenIn = DIRT;
      let tokenInAmount = toWei('500')
      let tokenOut = ROCK
      let minAmountOut = toWei('0')
      let maxPrice = MAX

      let output = await pool.swap_ExactAmountIn.call(tokenIn, tokenInAmount, tokenOut, minAmountOut, maxPrice);

      // Checking outputs
      let expected = toWei('8.23390841016124456')
      let actual = output[0];
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`output[0]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }
    
      assert.isAtMost(relDif, errorDelta);

      expected = toWei('74.1844011380065814')
      actual = output[1];
      relDif = calcRelativeDiff(expected, actual);

      if (verbose) {
          console.log(`output[1]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });


    it('swap_ExactAmountOut', async () => {

      let tokenIn = DIRT;
      let maxAmountIn = MAX;
      let tokenOut = ROCK
      let tokenAmountOut = toWei('333.333333333333333333');
      let maxPrice = MAX;

      let output = await pool.swap_ExactAmountOut.call(tokenIn, maxAmountIn, tokenOut, tokenAmountOut, maxPrice);

      // Checking outputs
      let expected = toWei(`425506505648.348073`);
      let actual = output[0];
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`output[0]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }
    
      assert.isAtMost(relDif, errorDelta);

      expected = toWei('31306034272.9265099');
      actual = output[1];
      relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`output[1]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });

    it('swap_ExactMarginalPrice', async () => {
      // Use the same numbers (Ai, Ao, Price) as with ExactAmountIn

      let tokenIn = DIRT;
      let limitAmountIn = MAX;
      let tokenOut = ROCK;
      let limitAmountOut = toWei('0')
      let marginalPrice = toWei('74.1844011380065814')

      let output = await pool.swap_ExactMarginalPrice.call(tokenIn, limitAmountIn, tokenOut, limitAmountOut, marginalPrice);

      // Checking outputs
      let expected = toWei('500')
      let actual = output[0];
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`output[0]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }
    
      assert.isAtMost(relDif, errorDelta);

      expected = toWei('8.23390841016124456')
      actual = output[1];
      relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`output[1]`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 

    });

    it('joinPool', async () => {

      currentPoolBalance = 100;
      await pool.finalize(toWei(String(currentPoolBalance)));

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

      // Print current balances after operation
      await logAndAssertCurrentBalances();        
    });

    it('exitPool', async () => {
      // Call function 
      let pAi = 1/(1-exitFee); // so that the balances of all tokens will go back exactly to what they were before joinPool()
      let pAiAfterExitFee = pAi*(1-exitFee)

      await pool.exitPool(toWei(String(pAi)));

      // Update balance states
      previousPoolBalance = currentPoolBalance;
      currentPoolBalance -= pAiAfterExitFee; 
      // Balances of all tokens increase proportionally to the pool balance
      previousDirtBalance = currentDirtBalance;
      currentDirtBalance -= pAiAfterExitFee/previousPoolBalance * previousDirtBalance; 
      previousRockBalance = currentRockBalance;
      currentRockBalance -= pAiAfterExitFee/previousPoolBalance * previousRockBalance; 

      // Print current balances after operation
      await logAndAssertCurrentBalances();    
    });


    it('joinswap_ExternAmountIn', async () => {

      // Call function 
      let tokenRatio = 1.1;
      let tAi = 1/(1-swapFee*(1-dirtNorm))*currentDirtBalance*(tokenRatio-1); // increase tbalance by 1.1 after swap fee
      let pAo = await pool.joinswap_ExternAmountIn(DIRT, toWei(String(tAi))); 

      // Update balance states
      previousDirtBalance = currentDirtBalance;
      currentDirtBalance += tAi;
      previousPoolBalance = currentPoolBalance;
      currentPoolBalance *= tokenRatio**dirtNorm; // increase by 1.1**dirtNorm

      // Print current balances after operation
      await logAndAssertCurrentBalances(); 
    });


    it('joinswap_PoolAmountOut', async () => {

      // Call function 
      let poolRatio = 1.1;
      let pAo = currentPoolBalance*(poolRatio-1);
      let tAi = await pool.joinswap_PoolAmountOut(toWei(String(pAo)), ROCK); // 10% of current supply

      // Update balance states
      previousPoolBalance = currentPoolBalance;
      currentPoolBalance *= poolRatio; // increase by 1.1
      previousRockBalance = currentRockBalance;
      currentRockBalance += previousRockBalance*(poolRatio**(1/rockNorm)-1)*1/(1-swapFee*(1-rockNorm)); // (21% + swap fees) addition to current Rock supply ;

      // Print current balances after operation
      await logAndAssertCurrentBalances(); 
    });


    it('exitswap_PoolAmountIn', async () => {

      // Call function 
      let poolRatioAfterExitFee = 0.9;
      let pAi = currentPoolBalance * (1-poolRatioAfterExitFee)*(1/(1-exitFee));
      let tAo = await pool.exitswap_PoolAmountIn(toWei(String(pAi)),DIRT);

      // Update balance states
      previousPoolBalance = currentPoolBalance;
      currentPoolBalance -= pAi*(1-exitFee); 
      previousDirtBalance = currentDirtBalance;
      currentDirtBalance -= previousDirtBalance*(1-poolRatioAfterExitFee**(1/dirtNorm))*(1-swapFee*(1-dirtNorm));

      // Print current balances after operation
      await logAndAssertCurrentBalances();
    });


    it('exitswap_ExternAmountOut', async () => {

      // Call function 
      let poolRatioAfterExitFee = 0.9;
      let tokenRatioBeforeSwapFee = poolRatioAfterExitFee**(1/rockNorm);
      let tAo = currentRockBalance * (1-tokenRatioBeforeSwapFee)*(1-swapFee*(1-rockNorm));
      let pAi = await pool.exitswap_ExternAmountOut(ROCK, toWei(String(tAo)));

      // Update balance states
      previousRockBalance = currentRockBalance;
      currentRockBalance -= tAo
      previousPoolBalance = currentPoolBalance;
      currentPoolBalance -= previousPoolBalance*(1-poolRatioAfterExitFee);

      // Print current balances after operation
      await logAndAssertCurrentBalances();
    });

    it('pAo = joinswap_ExternAmountIn(joinswap_PoolAmountOut(pAo))', async () => {

      let pAo = 0.1;
      let tAi = await pool.joinswap_PoolAmountOut.call(toWei(String(pAo)),DIRT);
      let calculatedPAo = await pool.joinswap_ExternAmountIn.call(DIRT, String(tAi)); // NO toWei since tAo is already in wei
      
      let expected = pAo*10**18;
      let actual = calculatedPAo;
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`tAi: ${tAi})`);
          console.log(`pAo`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });


    it('tAi = joinswap_PoolAmountOut(joinswap_ExternAmountIn(tAi))', async () => {
      
      let tAi = '1';
      let pAo = await pool.joinswap_ExternAmountIn.call(ROCK, toWei(tAi));
      let calculatedtAi = await pool.joinswap_PoolAmountOut.call(String(pAo), ROCK); // NO toWei since pAi is already in wei
      
      let expected = toWei(tAi);
      let actual = calculatedtAi;
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`pAo: ${pAo})`);
          console.log(`tAi`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });


    it('pAi = exitswap_ExternAmountOut(exitswap_PoolAmountIn(pAi))', async () => {

      let pAi = 0.1;
      let tAo = await pool.exitswap_PoolAmountIn.call(toWei(String(pAi)),DIRT);
      let calculatedPAi = await pool.exitswap_ExternAmountOut.call(DIRT, String(tAo)); // NO toWei since tAo is already in wei
      
      let expected = pAi*10**18;
      let actual = calculatedPAi;
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`tAo: ${tAo})`);
          console.log(`pAi`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });


    it('tAo = exitswap_PoolAmountIn(exitswap_ExternAmountOut(tAo))', async () => {

      let tAo = 1;
      let pAi = await pool.exitswap_ExternAmountOut.call(ROCK, toWei(String(tAo)));
      let calculatedtAo = await pool.exitswap_PoolAmountIn.call(String(pAi), ROCK); // NO toWei since pAi is already in wei
      
      let expected = tAo*10**18;
      let actual = calculatedtAo;
      let relDif = calcRelativeDiff(expected,actual);

      if (verbose) {
          console.log(`pAi: ${pAi})`);
          console.log(`tAo`);
          console.log(`expected: ${expected})`);
          console.log(`actual  : ${actual})`);
          console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif, errorDelta); 
    });
  });
});
