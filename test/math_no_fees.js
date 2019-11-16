const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');
const errorDelta = 10**-8;
const verbose = process.env.VERBOSE;

function calcRelativeDiff(_expected, _actual) {
  return Math.abs((_expected - _actual)/_expected);
}

contract('math tests from canonical setup', async (accounts) => {
  const admin = accounts[0];
  const toHex = web3.utils.toHex;
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


    await tokens.build(toHex("DIRT"));
    await tokens.build(toHex("ROCK"));
    await tokens.build(toHex("SAND"));

    DIRT = await tokens.get.call(toHex("DIRT"));
    ROCK = await tokens.get.call(toHex("ROCK"));
    SAND = await tokens.get.call(toHex("SAND"));

    dirt = await TToken.at(DIRT);
    rock = await TToken.at(ROCK);
    sand = await TToken.at(SAND);

    await dirt.mint(MAX);
    await rock.mint(MAX);
    await sand.mint(MAX);

    await dirt.approve(POOL, MAX);
    await rock.approve(POOL, MAX);
    await sand.approve(POOL, MAX);


    await pool.bind(DIRT, dirtBalance, dirtDenorm);
    await pool.bind(ROCK, rockBalance, rockDenorm);
    await pool.bind(SAND, sandBalance, sandDenorm);

    await pool.setPublicSwap(true);
    
  });

  it('swap_ExactMarginalPrice', async () => {
    let MarPrice = 1;

    let output = await pool.swap_ExactMarginalPrice.call(DIRT, MAX, ROCK, '0', toWei(String(MarPrice)));
    let Ai = parseInt(output[0]);
    let Ao = parseInt(output[1]);

    // Checking outputs
        expected = toWei(String(48**0.5-6));
    let actual = Ai;
    let relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Ai`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    }
  
    assert.isAtMost(relDif, errorDelta);


    expected = toWei(String(8-48**0.5))
    actual = Ao;
    relDif = calcRelativeDiff(expected,actual);
    if(verbose){
        console.log(`Ao`);
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
    } 
    assert.isAtMost(relDif, errorDelta);  

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
  
    assert.isAtMost(relDif, errorDelta);
  });


});