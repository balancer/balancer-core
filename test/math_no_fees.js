const { assertThrow } = require('../lib/tests/assertThrow');
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const MaxError = 10**-9;
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

  const dirtBalance = toWei('6')
  const dirtDenorm = toWei('10');

  const rockBalance = toWei('8')
  const rockDenorm = toWei('10');

  const sandBalance = toWei('24')
  const sandDenorm = toWei('20');

  const sumWeigths = parseInt(dirtDenorm)+parseInt(rockDenorm);
  const dirtNorm = parseInt(dirtDenorm)/sumWeigths;
  const rockNorm = parseInt(rockDenorm)/sumWeigths;

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

    await tokens.build(toHex("SAND"));
    SAND = await tokens.get.call(toHex("SAND"));
    sand = await TToken.at(SAND);
    console.log(`sand := tokens.build('SAND')`);

    await dirt.mint(MAX);
    console.log("dirt.mint(MAX);");
    await dirt.approve(POOL, MAX);
    console.log("dirt.approve(POOL, MAX);");

    await rock.mint(MAX);
    console.log("rock.mint(MAX);");
    await rock.approve(POOL, MAX);
    console.log("rock.approve(POOL, MAX);");

    await sand.mint(MAX);
    console.log("sand.mint(MAX);");
    await sand.approve(POOL, MAX);
    console.log("sand.approve(POOL, MAX);");

    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    console.log(`pool.bind(DIRT, ${dirtBalance}, ${dirtDenorm})`);

    await pool.bind(ROCK, rockBalance, rockDenorm);
    console.log(`pool.bind(ROCK, ${rockBalance}, ${rockDenorm})`);

    await pool.bind(SAND, sandBalance, sandDenorm);
    console.log(`pool.bind(SAND, ${sandBalance}, ${sandDenorm})`);

    await pool.setPublicSwap(true);
    console.log('pool.setPublicSwap(true);');
    await pool.setPublicJoin(true);
    console.log('pool.setPublicJoin(true);');
  });

  beforeEach(async () => {
    //await pool.rebind(DIRT, dirtBalance, dirtDenorm);
    //console.log(`pool.rebind(DIRT, ${dirtBalance}, ${dirtDenorm})`);
    //await pool.rebind(ROCK, rockBalance, rockDenorm);
    //console.log(`pool.rebind(ROCK, ${rockBalance}, ${rockDenorm})`);
  });

  /*

  it('swap_ExactAmountIn', async () => {
    //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactAmountIn`, 
                    [DIRT, toWei('2'), ROCK, '0', MAX],  
                    [toWei('2'),toWei('1.333333333333333333')], 
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

  it('swap_ExactAmountIn ERR_MAX_IN_RATIO', async () => {
    await assertThrow( pool.swap_ExactAmountIn(DIRT, toWei('3.00001'), ROCK, '0', MAX)
                     , 'ERR_MAX_IN_RATIO' );
  });

  it('swap_ExactAmountOut', async () => {
        //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let test = [`swap_ExactAmountOut`, 
                    [ROCK, MAX, DIRT, toWei('2'), MAX],  
                    [toWei('4'),toWei('3')], 
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

  it('swap_ExactAmountOut ERR_MAX_OUT_RATIO', async () => {
    await assertThrow( pool.swap_ExactAmountOut(ROCK, MAX, DIRT, toWei('2.0001'), '0')
                     , 'ERR_MAX_OUT_RATIO' );
  });

  it('swap_ExactAmountOut ERR_ARG_LIMIT_IN ERR_LIMIT_OUT ERR_LIMIT_PRICE');

  */

  it('swap_ExactMarginalPrice', async () => {
    //let test = [functionName, inputParameters, outputParameters, deltaAccountBalances, deltaPoolBalances, deltaPoolTokens];
    let MarPrice = 1;
    let test = [`swap_ExactMarginalPrice`, 
                    [DIRT, MAX, ROCK, '0', toWei(String(MarPrice))],  
                    [toWei(String(48**0.5-6)),toWei(String(8-48**0.5))], 
                    0, //deltaAccountBalances, 
                    0, //deltaPoolBalances, 
                    0]; //deltaPoolSupply];

    let output = await pool.swap_ExactMarginalPrice.call(test[1][0], test[1][1], test[1][2], test[1][3], test[1][4]);
    let Ai = parseInt(output[0]);
    let Ao = parseInt(output[1]);

    // Checking outputs
    let expected = parseInt(test[2][0]);
    let actual = Ai;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Ai`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true);

    expected = parseInt(test[2][1]);
    actual = Ao;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Ao`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    } 
    assert.equal(relDif<MaxError, true);  

    // Checking outputs
    expected = MarPrice;
    actual = (parseInt(dirtBalance)+Ai)*rockNorm/((parseInt(rockBalance)-Ao)*dirtNorm);
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Ai: ${Ai})`);
        console.log(`Ao: ${Ao})`);
        console.log(`MarPrice`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true);
  });

  /*
  it('swap_ExactMarginalPrice ERR_ARG_LIMIT_PRICE', async () => {
    await assertThrow( pool.swap_ExactMarginalPrice(DIRT, MAX, ROCK, '0', toWei('0.5'))
                     , 'ERR_ARG_LIMIT_PRICE' ); //0.666 -> 1.001  increase of more than 1.5 

  });

  it('swap_ExactMarginalPrice ERR_MAX_OUT_RATIO ERR_LIMIT_OUT ERR_LIMIT_PRICE');

  it('joinPool', async () => {

    await pool.finalize(toWei('100'));
    let totalSupplyBeforeJoin = await pool.totalSupply.call();
    let result2 = await pool.joinPool(toWei('1'));

    let totalSupplyAfterJoin = await pool.totalSupply.call(); 

    let expected = parseInt(toWei('100'));
    let actual = totalSupplyBeforeJoin;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('101'));
    actual = totalSupplyAfterJoin;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 

    // TODO: add checks of the balances of DIRT and ROCK to make sure joinPool is pulling tokens correctly 
  });


  it('exitPool', async () => {
    let totalSupplyBeforeExit = await pool.totalSupply.call();
    let result2 = await pool.exitPool(toWei('1'));

    let totalSupplyAfterExit = await pool.totalSupply.call(); 

    let expected = parseInt(toWei('101'));
    let actual = totalSupplyBeforeExit;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('100'));
    actual = totalSupplyAfterExit;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 
    // TODO: add checks of the balances of DIRT and ROCK to make sure joinPool is pulling tokens correctly 
  });


  it('joinswap_ExternAmountIn', async () => {
    let totalSupplyBeforeJoin = await pool.totalSupply.call();
    let pAo = await pool.joinswap_ExternAmountIn.call(DIRT, toWei(String(6*(0.4641)))); // 1.1^4 - 1 = 0.4641 -> 4 is the total weigths divided by weight of DIRT (40/10)
    
    // Now execute same txn called above
    await pool.joinswap_ExternAmountIn(DIRT, toWei(String(6*(0.4641)))); 


    let totalSupplyAfterJoin = await pool.totalSupply.call(); 

    let expected = 10*10**18; // poolRatio = 1.1
    let actual = pAo;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`pAo`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 


    expected = parseInt(toWei('100'));
    actual = totalSupplyBeforeJoin;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('110')); // 10% addition to current supply 
    actual = totalSupplyAfterJoin;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 
  });


  it('joinswap_PoolAmountOut', async () => {
    let totalSupplyBeforeJoin = await pool.totalSupply.call();
    let tAi = await pool.joinswap_PoolAmountOut.call(toWei('11'), ROCK); // 10% of current supply
    
    // Now execute same txn called above
    await pool.joinswap_PoolAmountOut(toWei('11'), ROCK); 

    let totalSupplyAfterJoin = await pool.totalSupply.call(); 

    let expected = 8*(0.4641)*10**18; // 0.4641 -> 1.1^4 - 1 = 0.4641
    let actual = tAi;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`tAi`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 


    expected = parseInt(toWei('110'));
    actual = totalSupplyBeforeJoin;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('121')); // 10% addition to current supply 
    actual = totalSupplyAfterJoin;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterJoin`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 
  });


  it('exitswap_PoolAmountIn', async () => {
    let totalSupplyBeforeExit = await pool.totalSupply.call();
    let tAo = await pool.exitswap_PoolAmountIn.call(toWei('11'),DIRT);

    // Now execute same txn called above
    await pool.exitswap_PoolAmountIn(toWei('11'),DIRT);

    let expected = 6*(0.4641)*10**18; // 0.4641 -> 1.1^4 - 1 = 0.4641
    let actual = tAo;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`tAo`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    let totalSupplyAfterExit = await pool.totalSupply.call(); 

    expected = parseInt(toWei('121'));
    actual = totalSupplyBeforeExit;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('110'));
    actual = totalSupplyAfterExit;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 
    // TODO: add checks of the balances of DIRT and ROCK to make sure joinPool is pulling tokens correctly 
  });

  it('exitswap_ExternAmountOut', async () => {
    let totalSupplyBeforeExit = await pool.totalSupply.call();
    let pAi = await pool.exitswap_ExternAmountOut.call(ROCK, toWei(String(3.7128))); // 3.7128 = 8*0.4641 -> 1.1^4 - 1 = 0.4641
    // Now execute same txn called above
    await pool.exitswap_ExternAmountOut(ROCK, toWei(String(3.7128))); // 3.7128 = 8*0.4641 -> 1.1^4 - 1 = 0.4641

    let expected = 10*10**18; // poolRatio = 1.1
    let actual = pAi;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`pAi`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    let totalSupplyAfterExit = await pool.totalSupply.call(); 

    expected = parseInt(toWei('110'));
    actual = totalSupplyBeforeExit;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyBeforeExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }

    assert.equal(relDif<MaxError, true); 

    expected = parseInt(toWei('100'));
    actual = totalSupplyAfterExit;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`totalSupplyAfterExit`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.equal(relDif<MaxError, true); 
    // TODO: add checks of the balances of DIRT and ROCK to make sure joinPool is pulling tokens correctly 
  });
*/


});