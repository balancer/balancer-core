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

contract BPool is BBronze, BToken, BMath
{
    // Invariant: if any one field of a Record is zero, then the rest are zero
    // Invariant: MIN_WEIGHT < denorm < MAX_WEIGHT
    // Invariant: MIN_BALANCE < balance < MAX_BALANCE
    struct Record {
        uint index;   // private and off-by-one to maintain invariant
        uint denorm;  // denormalized weight
        uint balance;
    }

    event LOG_SWAP( address indexed caller
                  , address indexed tokenIn
                  , address indexed tokenOut
                  , uint256         amountIn
                  , uint256         amountOut );

    event LOG_JOIN( address indexed caller
                  , address indexed tokenIn
                  , uint256         amountIn);

    event LOG_EXIT( address indexed caller
                  , address indexed tokenOut
                  , uint256         amountOut);

    event LOG_CALL( bytes4  indexed sig
                  , address indexed caller
                  , bytes           data
                  )
          anonymous;

    modifier _logs_() {
        emit LOG_CALL(msg.sig, msg.sender, msg.data);
        _;
    }

    modifier _lock_() {
        require( !_mutex, ERR_REENTRY);
        _mutex = true;
        _;
        _mutex = false;
    }

    modifier _viewlock_() {
        require( !_mutex, ERR_REENTRY);
        _;
    }

    bool                      _mutex; // TODO: consider  messageNonce

    // Emulates a rudimentary role-based access control system
    address                   _factory;    // has FACTORY role
    address                   _controller; // has CONTROL role
    bool                      _publicSwap; // true if PUBLIC can call SWAP functions
    bool                      _publicJoin; // true if PUBLIC can call JOIN functions
    bool                      _publicExit; // true if PUBLIC can call Exit functions
                                           //   always true for bronze pools!

    // `setSwapFee` and `finalize` require CONTROL
    // `finalize` sets `PUBLIC can SWAP`, `PUBLIC can JOIN`, and sets `_controller` to NULL
    uint                      _swapFee;
    bool                      _finalized;

    address[]                 _tokens;
    mapping(address=>Record)  _records;
    uint                      _totalWeight;

    constructor() public {
        _controller = msg.sender;
        _factory = msg.sender;

        _publicSwap = false;
        _publicJoin = false;
        _finalized = false;

        _publicExit = true;
    }

    function isPublicSwap()
        public view
        returns (bool)
    {
        return _publicSwap;
    }

    function isPublicJoin()
        public view
        returns (bool)
    {
        return _publicJoin;
    }

    function isPublicExit()
        public view
        returns (bool)
    {
        return _publicExit;
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
        require( isBound(token), ERR_NOT_BOUND);
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
        require( isBound(token), ERR_NOT_BOUND);
        uint denorm = _records[token].denorm;
        return bdiv(denorm, _totalWeight);
    }

    function getBalance(address token)
        external view
        _viewlock_
        returns (uint)
    {
        require( isBound(token), ERR_NOT_BOUND);
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
        require( ! _finalized, ERR_IS_FINALIZED);
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
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicSwap = public_;
    }

    function setPublicJoin(bool public_)
        external
        _logs_
        _lock_
    {
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicJoin = public_;
    }

    function setPublicExit(bool public_)
        external
        _logs_
        _lock_
    {
        require( public_, ERR_EXIT_ALWAYS_PUBLIC );
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicExit = public_;
    }

    function finalize(uint initSupply)
        external
        _logs_
        _lock_
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require( !_finalized, ERR_IS_FINALIZED);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);

        _finalized = true;
        _publicSwap = true;
        _publicJoin = true;
        _publicExit = true;

        _mintPoolShare(initSupply);
        _pushPoolShare(msg.sender, initSupply);
    }


    function bind(address token, uint balance, uint denorm)
        external
        _logs_
        // _lock_  Bind does not lock because it jumps to `rebind`, which does
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require( ! isBound(token), ERR_IS_BOUND);
        require( ! isFinalized(), ERR_IS_FINALIZED);

        require(_tokens.length < MAX_BOUND_TOKENS, ERR_MAX_TOKENS);

        uint length = _tokens.push(token);
        _records[token] = Record({
            index: length // 1-indexed (0 is 'unbound' state)
          , denorm: 0    // balance and denorm will be validated
          , balance: 0   // and set by `rebind`
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
        require( ! _finalized, ERR_IS_FINALIZED);

        require(denorm >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(denorm <= MAX_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);

        // Adjust the denorm and totalWeight
        uint oldWeight = _records[token].denorm;
        if (denorm > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(denorm, oldWeight));
            require( _totalWeight <= MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT );
        } else {
            _totalWeight = bsub(_totalWeight, bsub(oldWeight, denorm));
        }        
        _records[token].denorm = denorm;

        // Adjust the balance record and actual token balance
        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;
        if (balance > oldBalance) {
            _pullUnderlying(token, msg.sender, bsub(balance, oldBalance));
        } else if( balance < oldBalance) {
            // In this case liquidity is being withdrawn, so charge EXIT_FEE
            uint tokenBalanceWithdrawn = bsub(oldBalance, balance);
            uint tokenExitFee = bmul(tokenBalanceWithdrawn,EXIT_FEE);
            _pushUnderlying(token, msg.sender, bsub(tokenBalanceWithdrawn,tokenExitFee));
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
        require( ! _finalized, ERR_IS_FINALIZED);

        uint tokenBalance = _records[token].balance;
        uint tokenExitFee = bmul(tokenBalance,EXIT_FEE);

        _totalWeight = bsub(_totalWeight, _records[token].denorm);

        // Swap the token-to-unbind with the last token,
        // then delete the last token
        uint index = _records[token].index - 1;
        uint last = _tokens.length - 1;
        _tokens[index] = _tokens[last];
        _records[_tokens[index]].index = index + 1;
        _records[token] = Record({
            index: 0
          , denorm: 0
          , balance: 0
        });
        _tokens.pop();

        _pushUnderlying(token, msg.sender, bsub(tokenBalance,tokenExitFee));
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

    function getSpotPrice(address Ti, address To)
        external view
        _viewlock_
        returns (uint P)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
    }

    function getSpotPriceSansFee(address Ti, address To)
        external view
        _viewlock_
        returns (uint P)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, 0);
    }

    function joinPool(uint poolAo)
        external
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);
        require(isPublicJoin(), ERR_JOIN_NOT_PUBLIC);

        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
        for( uint i = 0; i < _tokens.length; i++ ) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tAi = bmul(ratio, bal);
            _records[t].balance = badd(_records[t].balance, tAi);
            _pullUnderlying(t, msg.sender, tAi);

            emit LOG_JOIN(msg.sender, t, tAi);
        }
        _mintPoolShare(poolAo);
        _pushPoolShare(msg.sender, poolAo);
    }

    function exitPool(uint pAi)
        external
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);
        require(isPublicExit(), ERR_EXIT_NOT_PUBLIC);

        uint poolTotal = totalSupply();
        uint pAiExitFee = bmul(pAi, EXIT_FEE);
        uint pAiAfterExitFee = bsub(pAi, pAiExitFee);
        uint ratio = bdiv(pAiAfterExitFee, poolTotal);
       
        _pullPoolShare(msg.sender, pAi);
        _pushPoolShare(_factory, pAiExitFee);
        _burnPoolShare(pAiAfterExitFee);

        for( uint i = 0; i < _tokens.length; i++ ) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tAo = bmul(ratio, bal);
            _records[t].balance = bsub(_records[t].balance, tAo);
            _pushUnderlying(t, msg.sender, tAo);

            emit LOG_EXIT(msg.sender, t, tAo);
        }

    }


    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint MinAo, uint MaxP)
        external
        _logs_
        _lock_
        returns (uint Ao, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require( Ai <= bmul(I.balance, MAX_IN_RATIO), ERR_MAX_IN_RATIO );

        uint SP0 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require( SP0 <= MaxP, ERR_BAD_LIMIT_PRICE );

        Ao = _calc_OutGivenIn(I.balance, I.denorm, O.balance, O.denorm, Ai, _swapFee);
        require( Ao >= MinAo, ERR_LIMIT_OUT );

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        uint SP1 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(SP1 >= SP0, ERR_MATH_APPROX);     
        require(SP1 <= MaxP, ERR_LIMIT_PRICE);
        require(SP0 <= bdiv(Ai,Ao), ERR_MATH_APPROX);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ao, SP1);
    }

    function swap_ExactAmountOut(address Ti, uint MaxAi, address To, uint Ao, uint MaxP)
        external
        _logs_
        _lock_ 
        returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO );

        uint SP0 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(SP0 <= MaxP, ERR_BAD_LIMIT_PRICE );

        Ai = _calc_InGivenOut(I.balance, I.denorm, O.balance, O.denorm, Ao, _swapFee);
        require( Ai <= MaxAi, ERR_LIMIT_IN);

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        uint SP1 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(SP1 >= SP0, ERR_MATH_APPROX);
        require(SP1 <= MaxP, ERR_LIMIT_PRICE);
        require(SP0 <= bdiv(Ai,Ao), ERR_MATH_APPROX);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ai, SP1);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MarP)
        external
        _logs_
        _lock_
        returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO);

        uint SP0 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(MarP > SP0, ERR_BAD_LIMIT_PRICE);

        Ai = _calc_InGivenPrice( I.balance, I.denorm, O.balance, O.denorm, MarP, _swapFee );
        Ao = _calc_OutGivenIn( I.balance, I.denorm, O.balance, O.denorm, Ai, _swapFee );

        require( Ai <= Li, ERR_LIMIT_IN);
        require( Ao >= Lo, ERR_LIMIT_OUT);

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        uint SP1 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(SP1 >= SP0, ERR_MATH_APPROX);
        require(SP0 <= bdiv(Ai,Ao), ERR_MATH_APPROX);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ai, Ao);
    }

    function joinswap_ExternAmountIn(address Ti, uint256 tAi)
        external
        _logs_
        _lock_
        returns (uint pAo)
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isPublicJoin(), ERR_JOIN_NOT_PUBLIC );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage T = _records[Ti];

        pAo = _calc_PoolOutGivenSingleIn(T.balance, T.denorm, _totalSupply, _totalWeight, tAi, _swapFee);
        T.balance = badd(T.balance, tAi);

        _mintPoolShare(pAo);
        _pushPoolShare(msg.sender, pAo);
        _pullUnderlying(Ti, msg.sender, tAi);
        
        emit LOG_JOIN(msg.sender, Ti, tAi);

        return pAo;
    }

    function joinswap_PoolAmountOut(uint pAo, address Ti)
        external
        _logs_
        _lock_
        returns (uint tAi)
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isPublicJoin(), ERR_JOIN_NOT_PUBLIC );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage T = _records[Ti];

        tAi = _calc_SingleInGivenPoolOut(T.balance, T.denorm, _totalSupply, _totalWeight, pAo, _swapFee);
        T.balance = badd(T.balance, tAi);

        _mintPoolShare(pAo);
        _pushPoolShare(msg.sender, pAo);
        _pullUnderlying(Ti, msg.sender, tAi);
        
        emit LOG_JOIN(msg.sender, Ti, tAi);

        return tAi;
    }

    function exitswap_PoolAmountIn(uint pAi, address To)
        external
        _logs_
        _lock_
        returns (uint tAo)
    {
        require( isBound(To), ERR_NOT_BOUND );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );
        require( isPublicExit(), ERR_EXIT_NOT_PUBLIC);

        Record storage T = _records[To];

        tAo = _calc_SingleOutGivenPoolIn(T.balance, T.denorm, _totalSupply, _totalWeight, pAi, _swapFee);
        T.balance = bsub(T.balance, tAo);

        _pullPoolShare(msg.sender, pAi);
        uint pAiExitFee = bmul(pAi,EXIT_FEE);
        _burnPoolShare(bsub(pAi,pAiExitFee));
        _pushPoolShare(_factory, pAiExitFee);
        _pushUnderlying(To, msg.sender, tAo);

        emit LOG_EXIT(msg.sender, To, tAo);

        return tAo;
    }

    function exitswap_ExternAmountOut(address To, uint tAo)
        external
        _logs_
        _lock_
        returns (uint pAi)
    {
        require( isBound(To), ERR_NOT_BOUND );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );
        require( isPublicExit(), ERR_EXIT_NOT_PUBLIC);

        Record storage T = _records[To];

        pAi = _calc_PoolInGivenSingleOut(T.balance, T.denorm, _totalSupply, _totalWeight, tAo, _swapFee);
        T.balance = bsub(T.balance, tAo);

        _pullPoolShare(msg.sender, pAi);
        uint pAiExitFee = bmul(pAi,EXIT_FEE);
        _burnPoolShare(bsub(pAi,pAiExitFee));
        _pushPoolShare(_factory, pAiExitFee);
        _pushUnderlying(To, msg.sender, tAo);        

        emit LOG_EXIT(msg.sender, To, tAo);

        return pAi;
    }


    // ==
    // 'Underlying' token-manipulation functions make external calls but are NOT locked
    // You must `_lock_` or otherwise ensure reentry-safety

    function _pullUnderlying(address erc20, address from, uint amt)
      internal
    {
        bool xfer = ERC20(erc20).transferFrom(from, address(this), amt);
        require(xfer, ERR_ERC20_FALSE);
    }

    function _pushUnderlying(address erc20, address to, uint amt)
      internal
    {
        bool xfer = ERC20(erc20).transfer(to, amt);
        require(xfer, ERR_ERC20_FALSE);
    }

    function _pullPoolShare(address from, uint amount)
      internal {
        _pull(from, amount);
    }

    function _pushPoolShare(address to, uint amount)
      internal {
        _push(to, amount);
    }

    function _mintPoolShare(uint amount)
      internal {
        _mint(amount);
    }

    function _burnPoolShare(uint amount)
      internal {
        _burn(amount);
    }

}
