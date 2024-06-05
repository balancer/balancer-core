// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.23;

import {BBronze} from './BColor.sol';

import {BMath} from './BMath.sol';

import {BToken} from './BToken.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IBPool} from 'interfaces/IBPool.sol';

contract BPool is BBronze, BToken, BMath, IBPool {
  bool internal _mutex;

  address internal _factory; // BFactory address to push token exitFee to
  address internal _controller; // has CONTROL role

  // `setSwapFee` and `finalize` require CONTROL
  // `finalize` sets `PUBLIC can SWAP`, `PUBLIC can JOIN`
  uint256 internal _swapFee;
  bool internal _finalized;

  address[] internal _tokens;
  mapping(address => Record) internal _records;
  uint256 internal _totalWeight;

  modifier _logs_() {
    emit LOG_CALL(msg.sig, msg.sender, msg.data);
    _;
  }

  modifier _lock_() {
    require(!_mutex, 'ERR_REENTRY');
    _mutex = true;
    _;
    _mutex = false;
  }

  modifier _viewlock_() {
    require(!_mutex, 'ERR_REENTRY');
    _;
  }

  constructor() {
    _controller = msg.sender;
    _factory = msg.sender;
    _swapFee = MIN_FEE;
    _finalized = false;
  }

  function setSwapFee(uint256 swapFee) external _logs_ _lock_ {
    require(!_finalized, 'ERR_IS_FINALIZED');
    require(msg.sender == _controller, 'ERR_NOT_CONTROLLER');
    require(swapFee >= MIN_FEE, 'ERR_MIN_FEE');
    require(swapFee <= MAX_FEE, 'ERR_MAX_FEE');
    _swapFee = swapFee;
  }

  function setController(address manager) external _logs_ _lock_ {
    require(msg.sender == _controller, 'ERR_NOT_CONTROLLER');
    _controller = manager;
  }

  function finalize() external _logs_ _lock_ {
    require(msg.sender == _controller, 'ERR_NOT_CONTROLLER');
    require(!_finalized, 'ERR_IS_FINALIZED');
    require(_tokens.length >= MIN_BOUND_TOKENS, 'ERR_MIN_TOKENS');

    _finalized = true;

    _mintPoolShare(INIT_POOL_SUPPLY);
    _pushPoolShare(msg.sender, INIT_POOL_SUPPLY);
  }

  function bind(address token, uint256 balance, uint256 denorm) external _logs_ _lock_ {
    require(msg.sender == _controller, 'ERR_NOT_CONTROLLER');
    require(!_records[token].bound, 'ERR_IS_BOUND');
    require(!_finalized, 'ERR_IS_FINALIZED');

    require(_tokens.length < MAX_BOUND_TOKENS, 'ERR_MAX_TOKENS');

    require(denorm >= MIN_WEIGHT, 'ERR_MIN_WEIGHT');
    require(denorm <= MAX_WEIGHT, 'ERR_MAX_WEIGHT');
    require(balance >= MIN_BALANCE, 'ERR_MIN_BALANCE');

    _totalWeight = badd(_totalWeight, denorm);
    require(_totalWeight <= MAX_TOTAL_WEIGHT, 'ERR_MAX_TOTAL_WEIGHT');

    _records[token] = Record({bound: true, index: _tokens.length, denorm: denorm});
    _tokens.push(token);

    _pullUnderlying(token, msg.sender, balance);
  }

  function unbind(address token) external _logs_ _lock_ {
    require(msg.sender == _controller, 'ERR_NOT_CONTROLLER');
    require(_records[token].bound, 'ERR_NOT_BOUND');
    require(!_finalized, 'ERR_IS_FINALIZED');

    _totalWeight = bsub(_totalWeight, _records[token].denorm);

    // Swap the token-to-unbind with the last token,
    // then delete the last token
    uint256 index = _records[token].index;
    uint256 last = _tokens.length - 1;
    _tokens[index] = _tokens[last];
    _records[_tokens[index]].index = index;
    _tokens.pop();
    _records[token] = Record({bound: false, index: 0, denorm: 0});

    _pushUnderlying(token, msg.sender, IERC20(token).balanceOf(address(this)));
  }

  function joinPool(uint256 poolAmountOut, uint256[] calldata maxAmountsIn) external _logs_ _lock_ {
    require(_finalized, 'ERR_NOT_FINALIZED');

    uint256 poolTotal = totalSupply();
    uint256 ratio = bdiv(poolAmountOut, poolTotal);
    require(ratio != 0, 'ERR_MATH_APPROX');

    for (uint256 i = 0; i < _tokens.length; i++) {
      address t = _tokens[i];
      uint256 bal = IERC20(t).balanceOf(address(this));
      uint256 tokenAmountIn = bmul(ratio, bal);
      require(tokenAmountIn != 0, 'ERR_MATH_APPROX');
      require(tokenAmountIn <= maxAmountsIn[i], 'ERR_LIMIT_IN');
      emit LOG_JOIN(msg.sender, t, tokenAmountIn);
      _pullUnderlying(t, msg.sender, tokenAmountIn);
    }
    _mintPoolShare(poolAmountOut);
    _pushPoolShare(msg.sender, poolAmountOut);
  }

  function exitPool(uint256 poolAmountIn, uint256[] calldata minAmountsOut) external _logs_ _lock_ {
    require(_finalized, 'ERR_NOT_FINALIZED');

    uint256 poolTotal = totalSupply();
    uint256 exitFee = bmul(poolAmountIn, EXIT_FEE);
    uint256 pAiAfterExitFee = bsub(poolAmountIn, exitFee);
    uint256 ratio = bdiv(pAiAfterExitFee, poolTotal);
    require(ratio != 0, 'ERR_MATH_APPROX');

    _pullPoolShare(msg.sender, poolAmountIn);
    _pushPoolShare(_factory, exitFee);
    _burnPoolShare(pAiAfterExitFee);

    for (uint256 i = 0; i < _tokens.length; i++) {
      address t = _tokens[i];
      uint256 bal = IERC20(t).balanceOf(address(this));
      uint256 tokenAmountOut = bmul(ratio, bal);
      require(tokenAmountOut != 0, 'ERR_MATH_APPROX');
      require(tokenAmountOut >= minAmountsOut[i], 'ERR_LIMIT_OUT');
      emit LOG_EXIT(msg.sender, t, tokenAmountOut);
      _pushUnderlying(t, msg.sender, tokenAmountOut);
    }
  }

  function swapExactAmountIn(
    address tokenIn,
    uint256 tokenAmountIn,
    address tokenOut,
    uint256 minAmountOut,
    uint256 maxPrice
  ) external _logs_ _lock_ returns (uint256 tokenAmountOut, uint256 spotPriceAfter) {
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');
    require(_finalized, 'ERR_NOT_FINALIZED');

    Record storage inRecord = _records[address(tokenIn)];
    Record storage outRecord = _records[address(tokenOut)];

    uint256 tokenInBalance = IERC20(tokenIn).balanceOf(address(this));
    uint256 tokenOutBalance = IERC20(tokenOut).balanceOf(address(this));

    require(tokenAmountIn <= bmul(tokenInBalance, MAX_IN_RATIO), 'ERR_MAX_IN_RATIO');

    uint256 spotPriceBefore =
      calcSpotPrice(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, _swapFee);
    require(spotPriceBefore <= maxPrice, 'ERR_BAD_LIMIT_PRICE');

    tokenAmountOut =
      calcOutGivenIn(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, tokenAmountIn, _swapFee);
    require(tokenAmountOut >= minAmountOut, 'ERR_LIMIT_OUT');

    tokenInBalance = badd(tokenInBalance, tokenAmountIn);
    tokenOutBalance = bsub(tokenOutBalance, tokenAmountOut);

    spotPriceAfter = calcSpotPrice(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, _swapFee);
    require(spotPriceAfter >= spotPriceBefore, 'ERR_MATH_APPROX');
    require(spotPriceAfter <= maxPrice, 'ERR_LIMIT_PRICE');
    require(spotPriceBefore <= bdiv(tokenAmountIn, tokenAmountOut), 'ERR_MATH_APPROX');

    emit LOG_SWAP(msg.sender, tokenIn, tokenOut, tokenAmountIn, tokenAmountOut);

    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return (tokenAmountOut, spotPriceAfter);
  }

  function swapExactAmountOut(
    address tokenIn,
    uint256 maxAmountIn,
    address tokenOut,
    uint256 tokenAmountOut,
    uint256 maxPrice
  ) external _logs_ _lock_ returns (uint256 tokenAmountIn, uint256 spotPriceAfter) {
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');
    require(_finalized, 'ERR_NOT_FINALIZED');

    Record storage inRecord = _records[address(tokenIn)];
    Record storage outRecord = _records[address(tokenOut)];

    uint256 tokenInBalance = IERC20(tokenIn).balanceOf(address(this));
    uint256 tokenOutBalance = IERC20(tokenOut).balanceOf(address(this));

    require(tokenAmountOut <= bmul(tokenOutBalance, MAX_OUT_RATIO), 'ERR_MAX_OUT_RATIO');

    uint256 spotPriceBefore =
      calcSpotPrice(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, _swapFee);
    require(spotPriceBefore <= maxPrice, 'ERR_BAD_LIMIT_PRICE');

    tokenAmountIn =
      calcInGivenOut(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, tokenAmountOut, _swapFee);
    require(tokenAmountIn <= maxAmountIn, 'ERR_LIMIT_IN');

    tokenInBalance = badd(tokenInBalance, tokenAmountIn);
    tokenOutBalance = bsub(tokenOutBalance, tokenAmountOut);

    spotPriceAfter = calcSpotPrice(tokenInBalance, inRecord.denorm, tokenOutBalance, outRecord.denorm, _swapFee);
    require(spotPriceAfter >= spotPriceBefore, 'ERR_MATH_APPROX');
    require(spotPriceAfter <= maxPrice, 'ERR_LIMIT_PRICE');
    require(spotPriceBefore <= bdiv(tokenAmountIn, tokenAmountOut), 'ERR_MATH_APPROX');

    emit LOG_SWAP(msg.sender, tokenIn, tokenOut, tokenAmountIn, tokenAmountOut);

    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return (tokenAmountIn, spotPriceAfter);
  }

  function joinswapExternAmountIn(
    address tokenIn,
    uint256 tokenAmountIn,
    uint256 minPoolAmountOut
  ) external _logs_ _lock_ returns (uint256 poolAmountOut) {
    require(_finalized, 'ERR_NOT_FINALIZED');
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');

    Record storage inRecord = _records[tokenIn];
    uint256 tokenInBalance = IERC20(tokenIn).balanceOf(address(this));
    require(tokenAmountIn <= bmul(tokenInBalance, MAX_IN_RATIO), 'ERR_MAX_IN_RATIO');

    poolAmountOut =
      calcPoolOutGivenSingleIn(tokenInBalance, inRecord.denorm, _totalSupply, _totalWeight, tokenAmountIn, _swapFee);
    require(poolAmountOut >= minPoolAmountOut, 'ERR_LIMIT_OUT');

    emit LOG_JOIN(msg.sender, tokenIn, tokenAmountIn);

    _mintPoolShare(poolAmountOut);
    _pushPoolShare(msg.sender, poolAmountOut);
    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);

    return poolAmountOut;
  }

  function joinswapPoolAmountOut(
    address tokenIn,
    uint256 poolAmountOut,
    uint256 maxAmountIn
  ) external _logs_ _lock_ returns (uint256 tokenAmountIn) {
    require(_finalized, 'ERR_NOT_FINALIZED');
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');

    Record storage inRecord = _records[tokenIn];
    uint256 tokenInBalance = IERC20(tokenIn).balanceOf(address(this));

    tokenAmountIn =
      calcSingleInGivenPoolOut(tokenInBalance, inRecord.denorm, _totalSupply, _totalWeight, poolAmountOut, _swapFee);

    require(tokenAmountIn != 0, 'ERR_MATH_APPROX');
    require(tokenAmountIn <= maxAmountIn, 'ERR_LIMIT_IN');
    require(tokenAmountIn <= bmul(tokenInBalance, MAX_IN_RATIO), 'ERR_MAX_IN_RATIO');

    emit LOG_JOIN(msg.sender, tokenIn, tokenAmountIn);

    _mintPoolShare(poolAmountOut);
    _pushPoolShare(msg.sender, poolAmountOut);
    _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);

    return tokenAmountIn;
  }

  function exitswapPoolAmountIn(
    address tokenOut,
    uint256 poolAmountIn,
    uint256 minAmountOut
  ) external _logs_ _lock_ returns (uint256 tokenAmountOut) {
    require(_finalized, 'ERR_NOT_FINALIZED');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');

    Record storage outRecord = _records[tokenOut];
    uint256 tokenOutBalance = IERC20(tokenOut).balanceOf(address(this));

    tokenAmountOut =
      calcSingleOutGivenPoolIn(tokenOutBalance, outRecord.denorm, _totalSupply, _totalWeight, poolAmountIn, _swapFee);

    require(tokenAmountOut >= minAmountOut, 'ERR_LIMIT_OUT');
    require(tokenAmountOut <= bmul(tokenOutBalance, MAX_OUT_RATIO), 'ERR_MAX_OUT_RATIO');

    uint256 exitFee = bmul(poolAmountIn, EXIT_FEE);

    emit LOG_EXIT(msg.sender, tokenOut, tokenAmountOut);

    _pullPoolShare(msg.sender, poolAmountIn);
    _burnPoolShare(bsub(poolAmountIn, exitFee));
    _pushPoolShare(_factory, exitFee);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return tokenAmountOut;
  }

  function exitswapExternAmountOut(
    address tokenOut,
    uint256 tokenAmountOut,
    uint256 maxPoolAmountIn
  ) external _logs_ _lock_ returns (uint256 poolAmountIn) {
    require(_finalized, 'ERR_NOT_FINALIZED');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');

    Record storage outRecord = _records[tokenOut];
    uint256 tokenOutBalance = IERC20(tokenOut).balanceOf(address(this));
    require(tokenAmountOut <= bmul(tokenOutBalance, MAX_OUT_RATIO), 'ERR_MAX_OUT_RATIO');

    poolAmountIn =
      calcPoolInGivenSingleOut(tokenOutBalance, outRecord.denorm, _totalSupply, _totalWeight, tokenAmountOut, _swapFee);
    require(poolAmountIn != 0, 'ERR_MATH_APPROX');
    require(poolAmountIn <= maxPoolAmountIn, 'ERR_LIMIT_IN');

    uint256 exitFee = bmul(poolAmountIn, EXIT_FEE);

    emit LOG_EXIT(msg.sender, tokenOut, tokenAmountOut);

    _pullPoolShare(msg.sender, poolAmountIn);
    _burnPoolShare(bsub(poolAmountIn, exitFee));
    _pushPoolShare(_factory, exitFee);
    _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

    return poolAmountIn;
  }

  function getSpotPrice(address tokenIn, address tokenOut) external view _viewlock_ returns (uint256 spotPrice) {
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');
    Record storage inRecord = _records[tokenIn];
    Record storage outRecord = _records[tokenOut];
    return calcSpotPrice(
      IERC20(tokenIn).balanceOf(address(this)),
      inRecord.denorm,
      IERC20(tokenOut).balanceOf(address(this)),
      outRecord.denorm,
      _swapFee
    );
  }

  function getSpotPriceSansFee(address tokenIn, address tokenOut) external view _viewlock_ returns (uint256 spotPrice) {
    require(_records[tokenIn].bound, 'ERR_NOT_BOUND');
    require(_records[tokenOut].bound, 'ERR_NOT_BOUND');
    Record storage inRecord = _records[tokenIn];
    Record storage outRecord = _records[tokenOut];
    return calcSpotPrice(
      IERC20(tokenIn).balanceOf(address(this)),
      inRecord.denorm,
      IERC20(tokenOut).balanceOf(address(this)),
      outRecord.denorm,
      0
    );
  }

  function isFinalized() external view returns (bool) {
    return _finalized;
  }

  function isBound(address t) external view returns (bool) {
    return _records[t].bound;
  }

  function getNumTokens() external view returns (uint256) {
    return _tokens.length;
  }

  function getCurrentTokens() external view _viewlock_ returns (address[] memory tokens) {
    return _tokens;
  }

  function getFinalTokens() external view _viewlock_ returns (address[] memory tokens) {
    require(_finalized, 'ERR_NOT_FINALIZED');
    return _tokens;
  }

  function getDenormalizedWeight(address token) external view _viewlock_ returns (uint256) {
    require(_records[token].bound, 'ERR_NOT_BOUND');
    return _records[token].denorm;
  }

  function getTotalDenormalizedWeight() external view _viewlock_ returns (uint256) {
    return _totalWeight;
  }

  function getNormalizedWeight(address token) external view _viewlock_ returns (uint256) {
    require(_records[token].bound, 'ERR_NOT_BOUND');
    uint256 denorm = _records[token].denorm;
    return bdiv(denorm, _totalWeight);
  }

  function getBalance(address token) external view _viewlock_ returns (uint256) {
    require(_records[token].bound, 'ERR_NOT_BOUND');
    return IERC20(token).balanceOf(address(this));
  }

  function getSwapFee() external view _viewlock_ returns (uint256) {
    return _swapFee;
  }

  function getController() external view _viewlock_ returns (address) {
    return _controller;
  }

  // ==
  // 'Underlying' token-manipulation functions make external calls but are NOT locked
  // You must `_lock_` or otherwise ensure reentry-safety

  function _pullUnderlying(address erc20, address from, uint256 amount) internal virtual {
    bool xfer = IERC20(erc20).transferFrom(from, address(this), amount);
    require(xfer, 'ERR_ERC20_FALSE');
  }

  function _pushUnderlying(address erc20, address to, uint256 amount) internal virtual {
    bool xfer = IERC20(erc20).transfer(to, amount);
    require(xfer, 'ERR_ERC20_FALSE');
  }

  function _pullPoolShare(address from, uint256 amount) internal {
    _pull(from, amount);
  }

  function _pushPoolShare(address to, uint256 amount) internal {
    _push(to, amount);
  }

  function _mintPoolShare(uint256 amount) internal {
    _mint(amount);
  }

  function _burnPoolShare(uint256 amount) internal {
    _burn(amount);
  }
}
