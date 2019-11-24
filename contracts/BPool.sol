// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.5.11;

import "./BColor.sol";
import "./BToken.sol";
import "./BMath.sol";

contract BPool is BBronze, BToken, BMath {
    // Invariant: MIN_WEIGHT < denorm < MAX_WEIGHT
    // Invariant: MIN_BALANCE < balance < MAX_BALANCE
    struct Record {
        uint index;   // private and off-by-one to maintain invariant
        uint denorm;  // denormalized weight
        uint balance;
    }

    event LOG_SWAP(
        address indexed caller,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256         tokenAmountIn,
        uint256         tokenAmountOut
    );

    event LOG_JOIN(
        address indexed caller,
        address indexed tokenIn,
        uint256         tokenAmountIn
    );

    event LOG_EXIT(
        address indexed caller,
        address indexed tokenOut,
        uint256         tokenAmountOut
    );

    event LOG_CALL(
        bytes4  indexed sig,
        address indexed caller,
        bytes           data
    ) anonymous;

    modifier _logs_() {
        emit LOG_CALL(msg.sig, msg.sender, msg.data);
        _;
    }

    modifier _lock_() {
        require(!_mutex, ERR_REENTRY);
        _mutex = true;
        _;
        _mutex = false;
    }

    modifier _viewlock_() {
        require(!_mutex, ERR_REENTRY);
        _;
    }

    bool                      _mutex; // TODO: consider  messageNonce

    // Emulates a rudimentary role-based access control system
    address                   _factory;    // has FACTORY role
    address                   _controller; // has CONTROL role
    bool                      _publicSwap; // true if PUBLIC can call SWAP functions

    // `setSwapFee` and `finalize` require CONTROL
    // `finalize` sets `PUBLIC can SWAP`, `PUBLIC can JOIN`
    uint                      _swapFee;
    bool                      _finalized;

    address[]                 _tokens;
    mapping(address=>Record)  _records;
    uint                      _totalWeight;

    constructor() public {
        _controller = msg.sender;
        _factory = msg.sender;

        _publicSwap = false;
        _finalized = false;
    }

    function isPublicSwap()
        public view
        returns (bool)
    {
        return _publicSwap;
    }

    function isFinalized()
        public view
        returns (bool)
    {
        return _finalized;
    }

    function isBound(address t)
        public view
        returns (bool)
    {
        return _records[t].index != 0;
    }

    function getNumTokens()
        external view
        returns (uint) 
    {
        return _tokens.length;
    }

    function getCurrentTokens()
        external view _viewlock_
        returns (address[] memory tokens)
    {
        return _tokens;
    }

    function getFinalTokens()
        external view
        _viewlock_
        returns (address[] memory tokens)
    {
        require(_finalized, ERR_NOT_FINALIZED);
        return _tokens;
    }

    function getDenormalizedWeight(address token)
        external view
        _viewlock_
        returns (uint)
    {
        require(isBound(token), ERR_NOT_BOUND);
        return _records[token].denorm;
    }

    function getTotalDenormalizedWeight()
        external view
        _viewlock_
        returns (uint)
    {
        return _totalWeight;
    }

    function getNormalizedWeight(address token)
        external view
        _viewlock_
        returns (uint)
    {
        require(isBound(token), ERR_NOT_BOUND);
        uint denorm = _records[token].denorm;
        return bdiv(denorm, _totalWeight);
    }

    function getBalance(address token)
        external view
        _viewlock_
        returns (uint)
    {
        require(isBound(token), ERR_NOT_BOUND);
        return _records[token].balance;
    }

    function getSwapFee()
        external view
        _viewlock_
        returns (uint)
    {
        return _swapFee;
    }

    function getController()
        external view
        _viewlock_
        returns (address)
    {
        return _controller;
    }

    function setSwapFee(uint swapFee)
        external
        _logs_
        _lock_
    { 
        require(!_finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        // TODO min fees
        require(swapFee <= MAX_FEE, ERR_MAX_FEE);
        _swapFee = swapFee;
    }

    function setController(address manager)
        external
        _logs_
        _lock_
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _controller = manager;
    }

    function setPublicSwap(bool public_)
        external
        _logs_
        _lock_
    {
        require(!_finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicSwap = public_;
    }

    function finalize(uint initSupply)
        external
        _logs_
        _lock_
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(!_finalized, ERR_IS_FINALIZED);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);

        _finalized = true;
        _publicSwap = true;

        _mintPoolShare(initSupply);
        _pushPoolShare(msg.sender, initSupply);
    }


    function bind(address token, uint balance, uint denorm)
        external
        _logs_
        // _lock_  Bind does not lock because it jumps to `rebind`, which does
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(!isBound(token), ERR_IS_BOUND);
        require(!isFinalized(), ERR_IS_FINALIZED);

        require(_tokens.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);

        uint length = _tokens.push(token);
        _records[token] = Record({
            index: length, // 1-indexed (0 is 'unbound' state)
            denorm: 0,    // balance and denorm will be validated
            balance: 0   // and set by `rebind`
        });
        rebind(token, balance, denorm);
    }

    function rebind(address token, uint balance, uint denorm)
        public
        _logs_
        _lock_
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(isBound(token), ERR_NOT_BOUND);
        require(!_finalized, ERR_IS_FINALIZED);

        require(denorm >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(denorm <= MAX_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);

        // Adjust the denorm and totalWeight
        uint oldWeight = _records[token].denorm;
        if (denorm > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(denorm, oldWeight));
            require(_totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT);
        } else {
            _totalWeight = bsub(_totalWeight, bsub(oldWeight, denorm));
        }        
        _records[token].denorm = denorm;

        // Adjust the balance record and actual token balance
        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;
        if (balance > oldBalance) {
            _pullUnderlying(token, msg.sender, bsub(balance, oldBalance));
        } else if (balance < oldBalance) {
            // In this case liquidity is being withdrawn, so charge EXIT_FEE
            uint tokenBalanceWithdrawn = bsub(oldBalance, balance);
            uint tokenExitFee = bmul(tokenBalanceWithdrawn, EXIT_FEE);
            _pushUnderlying(token, msg.sender, bsub(tokenBalanceWithdrawn, tokenExitFee));
            _pushUnderlying(token, _factory, tokenExitFee);
        }
    }

    function unbind(address token)
        external
        _logs_
        _lock_
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(isBound(token), ERR_NOT_BOUND);
        require(!_finalized, ERR_IS_FINALIZED);

        uint tokenBalance = _records[token].balance;
        uint tokenExitFee = bmul(tokenBalance, EXIT_FEE);

        _totalWeight = bsub(_totalWeight, _records[token].denorm);

        // Swap the token-to-unbind with the last token,
        // then delete the last token
        uint index = _records[token].index - 1;
        uint last = _tokens.length - 1;
        _tokens[index] = _tokens[last];
        _records[_tokens[index]].index = index + 1;
        _records[token] = Record({
            index: 0,
            denorm: 0,
            balance: 0
        });
        _tokens.pop();

        _pushUnderlying(token, msg.sender, bsub(tokenBalance, tokenExitFee));
        _pushUnderlying(token, _factory, tokenExitFee);
    }

    // Absorb any tokens that have been sent to this contract into the pool
    function gulp(address token)
        external
        _logs_
        _lock_
    {
        require(isBound(token), ERR_NOT_BOUND);
        _records[token].balance = ERC20(token).balanceOf(address(this));
    }

    function getSpotPrice(address tokenIn, address tokenOut)
        external view
        _viewlock_
        returns (uint spotPrice)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isBound(tokenOut), ERR_NOT_BOUND);
        Record storage I = _records[tokenIn];
        Record storage O = _records[tokenOut];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
    }

    function getSpotPriceSansFee(address tokenIn, address tokenOut)
        external view
        _viewlock_
        returns (uint spotPrice)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isBound(tokenOut), ERR_NOT_BOUND);
        Record storage I = _records[tokenIn];
        Record storage O = _records[tokenOut];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, 0);
    }

    function joinPool(uint poolAmountOut)
        external
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);

        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAmountOut, poolTotal);
        require(ratio != 0);

        for (uint i = 0; i < _tokens.length; i++) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tokenAmountIn = bmul(ratio, bal);
            _records[t].balance = badd(_records[t].balance, tokenAmountIn);
            _pullUnderlying(t, msg.sender, tokenAmountIn);

            emit LOG_JOIN(msg.sender, t, tokenAmountIn);
        }
        _mintPoolShare(poolAmountOut);
        _pushPoolShare(msg.sender, poolAmountOut);
    }

    function exitPool(uint poolAmountIn)
        external
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);

        uint poolTotal = totalSupply();
        uint exitFee = bmul(poolAmountIn, EXIT_FEE);
        uint pAiAfterExitFee = bsub(poolAmountIn, exitFee);
        uint ratio = bdiv(pAiAfterExitFee, poolTotal);
        require(ratio != 0);

        _pullPoolShare(msg.sender, poolAmountIn);
        _pushPoolShare(_factory, exitFee);
        _burnPoolShare(pAiAfterExitFee);

        for (uint i = 0; i < _tokens.length; i++) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tAo = bmul(ratio, bal);
            _records[t].balance = bsub(_records[t].balance, tAo);
            _pushUnderlying(t, msg.sender, tAo);

            emit LOG_EXIT(msg.sender, t, tAo);
        }

    }


    function swapExactAmountIn(address tokenIn, uint tokenAmountIn, address tokenOut, uint minAmountOut, uint maxPrice)
        external
        _logs_
        _lock_
        returns (uint tokenAmountOut, uint spotPriceTarget)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isBound(tokenOut), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage I = _records[address(tokenIn)];
        Record storage O = _records[address(tokenOut)];

        require(tokenAmountIn <= bmul(I.balance, MAX_IN_RATIO), ERR_MAX_IN_RATIO);

        uint spotPriceBefore = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(spotPriceBefore <= maxPrice, ERR_BAD_LIMIT_PRICE);

        tokenAmountOut = _calc_OutGivenIn(I.balance, I.denorm, O.balance, O.denorm, tokenAmountIn, _swapFee);
        require(tokenAmountOut >= minAmountOut, ERR_LIMIT_OUT);

        I.balance = badd(I.balance, tokenAmountIn);
        O.balance = bsub(O.balance, tokenAmountOut);

        uint spotPriceAfter = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(spotPriceAfter >= spotPriceBefore, ERR_MATH_APPROX);     
        require(spotPriceAfter <= maxPrice, ERR_LIMIT_PRICE);
        require(spotPriceBefore <= bdiv(tokenAmountIn, tokenAmountOut), ERR_MATH_APPROX);

        _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
        _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

        emit LOG_SWAP(msg.sender, tokenIn, tokenOut, tokenAmountIn, tokenAmountOut);

        return (tokenAmountOut, spotPriceAfter);
    }

    function swapExactAmountOut(address tokenIn, uint maxAmountIn, address tokenOut, uint tokenAmountOut, uint maxPrice)
        external
        _logs_
        _lock_ 
        returns (uint tokenAmountIn, uint spotPriceTarget)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isBound(tokenOut), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage I = _records[address(tokenIn)];
        Record storage O = _records[address(tokenOut)];

        require(tokenAmountOut <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO);

        uint spotPriceBefore = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(spotPriceBefore <= maxPrice, ERR_BAD_LIMIT_PRICE);

        tokenAmountIn = _calc_InGivenOut(I.balance, I.denorm, O.balance, O.denorm, tokenAmountOut, _swapFee);
        require(tokenAmountIn <= maxAmountIn, ERR_LIMIT_IN);

        I.balance = badd(I.balance, tokenAmountIn);
        O.balance = bsub(O.balance, tokenAmountOut);

        uint spotPriceAfter = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(spotPriceAfter >= spotPriceBefore, ERR_MATH_APPROX);
        require(spotPriceAfter <= maxPrice, ERR_LIMIT_PRICE);
        require(spotPriceBefore <= bdiv(tokenAmountIn, tokenAmountOut), ERR_MATH_APPROX);

        _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
        _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

        emit LOG_SWAP(msg.sender, tokenIn, tokenOut, tokenAmountIn, tokenAmountOut);

        return (tokenAmountIn, spotPriceAfter);
    }


    function swapExactMarginalPrice(address tokenIn, uint maxAmountIn, address tokenOut, uint minAmountOut, uint marginalPrice)
        external
        _logs_
        _lock_
        returns (uint tokenAmountIn, uint tokenAmountOut)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isBound(tokenOut), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage I = _records[address(tokenIn)];
        Record storage O = _records[address(tokenOut)];

        require(tokenAmountOut <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO);

        uint spotPriceBefore = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(marginalPrice > spotPriceBefore, ERR_BAD_LIMIT_PRICE);

        tokenAmountIn = _calc_InGivenPrice(I.balance, I.denorm, O.balance, O.denorm, _totalWeight, marginalPrice, _swapFee);
        tokenAmountOut = _calc_OutGivenIn(I.balance, I.denorm, O.balance, O.denorm, tokenAmountIn, _swapFee);

        require(tokenAmountIn <= maxAmountIn, ERR_LIMIT_IN);
        require(tokenAmountOut >= minAmountOut, ERR_LIMIT_OUT);

        I.balance = badd(I.balance, tokenAmountIn);
        O.balance = bsub(O.balance, tokenAmountOut);

        uint spotPriceAfter = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(spotPriceAfter >= spotPriceBefore, ERR_MATH_APPROX);
        require(spotPriceBefore <= bdiv(tokenAmountIn, tokenAmountOut), ERR_MATH_APPROX);

        _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
        _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

        emit LOG_SWAP(msg.sender, tokenIn, tokenOut, tokenAmountIn, tokenAmountOut);

        return (tokenAmountIn, tokenAmountOut);
    }

    function joinswapExternAmountIn(address tokenIn, uint256 tokenAmountIn)
        external
        _logs_
        _lock_
        returns (uint poolAmountOut)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage T = _records[tokenIn];

        poolAmountOut = _calc_PoolOutGivenSingleIn(T.balance, T.denorm, _totalSupply, _totalWeight, tokenAmountIn, _swapFee);
        T.balance = badd(T.balance, tokenAmountIn);

        _mintPoolShare(poolAmountOut);
        _pushPoolShare(msg.sender, poolAmountOut);
        _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
        
        emit LOG_JOIN(msg.sender, tokenIn, tokenAmountIn);

        return poolAmountOut;
    }

    function joinswapPoolAmountOut(uint poolAmountOut, address tokenIn)
        external
        _logs_
        _lock_
        returns (uint tokenAmountIn)
    {
        require(isBound(tokenIn), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage T = _records[tokenIn];

        tokenAmountIn = _calc_SingleInGivenPoolOut(T.balance, T.denorm, _totalSupply, _totalWeight, poolAmountOut, _swapFee);
        T.balance = badd(T.balance, tokenAmountIn);

        _mintPoolShare(poolAmountOut);
        _pushPoolShare(msg.sender, poolAmountOut);
        _pullUnderlying(tokenIn, msg.sender, tokenAmountIn);
        
        emit LOG_JOIN(msg.sender, tokenIn, tokenAmountIn);

        return tokenAmountIn;
    }

    function exitswapPoolAmountIn(uint poolAmountIn, address tokenOut)
        external
        _logs_
        _lock_
        returns (uint tokenAmountOut)
    {
        require(isBound(tokenOut), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage T = _records[tokenOut];

        tokenAmountOut = _calc_SingleOutGivenPoolIn(T.balance, T.denorm, _totalSupply, _totalWeight, poolAmountIn, _swapFee);
        T.balance = bsub(T.balance, tokenAmountOut);

        uint exitFee = bmul(poolAmountIn, EXIT_FEE);

        _pullPoolShare(msg.sender, poolAmountIn);
        _burnPoolShare(bsub(poolAmountIn, exitFee));
        _pushPoolShare(_factory, exitFee);
        _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);

        emit LOG_EXIT(msg.sender, tokenOut, tokenAmountOut);

        return tokenAmountOut;
    }

    function exitswapExternAmountOut(address tokenOut, uint tokenAmountOut)
        external
        _logs_
        _lock_
        returns (uint poolAmountIn)
    {
        require(isBound(tokenOut), ERR_NOT_BOUND);
        require(isPublicSwap(), ERR_SWAP_NOT_PUBLIC);

        Record storage T = _records[tokenOut];

        poolAmountIn = _calc_PoolInGivenSingleOut(T.balance, T.denorm, _totalSupply, _totalWeight, tokenAmountOut, _swapFee);
        T.balance = bsub(T.balance, tokenAmountOut);

        uint exitFee = bmul(poolAmountIn, EXIT_FEE);

        _pullPoolShare(msg.sender, poolAmountIn);
        _burnPoolShare(bsub(poolAmountIn, exitFee));
        _pushPoolShare(_factory, exitFee);
        _pushUnderlying(tokenOut, msg.sender, tokenAmountOut);        

        emit LOG_EXIT(msg.sender, tokenOut, tokenAmountOut);

        return poolAmountIn;
    }


    // ==
    // 'Underlying' token-manipulation functions make external calls but are NOT locked
    // You must `_lock_` or otherwise ensure reentry-safety

    function _pullUnderlying(address erc20, address from, uint amount)
        internal
    {
        bool xfer = ERC20(erc20).transferFrom(from, address(this), amount);
        require(xfer, ERR_ERC20_FALSE);
    }

    function _pushUnderlying(address erc20, address to, uint amount)
        internal
    {
        bool xfer = ERC20(erc20).transfer(to, amount);
        require(xfer, ERR_ERC20_FALSE);
    }

    function _pullPoolShare(address from, uint amount)
        internal
    {
        _pull(from, amount);
    }

    function _pushPoolShare(address to, uint amount)
        internal
    {
        _push(to, amount);
    }

    function _mintPoolShare(uint amount)
        internal
    {
        _mint(amount);
    }

    function _burnPoolShare(uint amount)
        internal
    {
        _burn(amount);
    }

}
