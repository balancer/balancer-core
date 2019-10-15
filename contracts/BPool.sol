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

import "contracts/BColor.sol";
import "contracts/BToken.sol";
import "contracts/BMath.sol";

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

    // `setFees` and `finalize` require CONTROL
    // `finalize` sets `PUBLIC can SWAP`, `PUBLIC can JOIN`, and sets `_controller` to NULL
    uint                      _swapFee;
    uint                      _exitFee;
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
    }

    function isPublicSwap()
      public view returns (bool) {
        return _publicSwap;
    }

    function isPublicJoin()
      public view returns (bool) {
        return _publicJoin;
    }

    function isFinalized()
      public view returns (bool) {
        return _finalized;
    }

    function isBound(address t) public view returns (bool) {
        return _records[t].index != 0;
    }

    function getNumTokens()
      public view returns (uint) {
        return _tokens.length;
    }

    function getCurrentTokens()
      public view _viewlock_
        returns (address[] memory tokens)
    {
        return _tokens;
    }

    function getFinalTokens()
      public view _viewlock_
        returns (address[] memory tokens)
    {
        require(_finalized, ERR_NOT_FINALIZED);
        return _tokens;
    }

    function getDenormalizedWeight(address token)
      public view _viewlock_
        returns (uint)
    {
        require( isBound(token), ERR_NOT_BOUND);
        return _records[token].denorm;
    }

    function getTotalDenormalizedWeight()
      public view _viewlock_
      returns (uint)
    {
        return _totalWeight;
    }

    function getNormalizedWeight(address token)
      public view _viewlock_
      returns (uint)
    {
        require( isBound(token), ERR_NOT_BOUND);
        uint denorm = _records[token].denorm;
        return bdiv(denorm, _totalWeight);
    }

    function getBalance(address token)
      public view _viewlock_
      returns (uint)
    {
        require( isBound(token), ERR_NOT_BOUND);
        return _records[token].balance;
    }

    function getFees()
      public view _viewlock_
        returns (uint,uint)
    {
        return (_swapFee, _exitFee);
    }

    function getController()
      public view _viewlock_
        returns (address) {
        return _controller;
    }

    function setFees(uint swapFee, uint exitFee)
      _logs_
      _lock_
      public
    { 
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        // TODO min fees
        require(swapFee <= MAX_FEE, ERR_MAX_FEE);
        require(exitFee <= MAX_FEE, ERR_MAX_FEE);
        _swapFee = swapFee;
        _exitFee = exitFee;
    }

    function setController(address manager)
      _logs_
      _lock_
      public
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _controller = manager;
    }

    function setPublicSwap(bool public_)
        _logs_
        _lock_
        public
    {
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicSwap = public_;
    }

    function setPublicJoin(bool public_)
        _logs_
        _lock_
        public
    {
        require( ! _finalized, ERR_IS_FINALIZED);
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        _publicJoin = public_;
    }

    function finalize(uint initSupply)
      _logs_
      _lock_
      public
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require( !_finalized, ERR_IS_FINALIZED);
        require(initSupply >= MIN_POOL_SUPPLY, ERR_MIN_POOL_SUPPLY);

        _finalized = true;
        _publicSwap = true;
        _publicJoin = true;

        _mintPoolShare(initSupply);
        _pushPoolShare(msg.sender, initSupply);
    }


    function bind(address token, uint balance, uint denorm)
      _logs_
      // _lock_  Bind does not lock because it jumps to `rebind`, which does
      public
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
      _logs_
      _lock_
      public
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(isBound(token), ERR_NOT_BOUND);
        require( ! _finalized, ERR_IS_FINALIZED);

        require(denorm >= MIN_WEIGHT, ERR_MIN_WEIGHT);
        require(denorm <= MAX_WEIGHT, ERR_MAX_WEIGHT);
        require(balance >= MIN_BALANCE, ERR_MIN_BALANCE);
        require(balance <= MAX_BALANCE, ERR_MAX_BALANCE);

        uint oldWeight = _records[token].denorm;
        if (denorm > oldWeight) {
            _totalWeight = badd(_totalWeight, bsub(denorm, oldWeight));
            require( _totalWeight < MAX_TOTAL_WEIGHT, ERR_MAX_TOTAL_WEIGHT );
        } else {
            _totalWeight = bsub(_totalWeight, bsub(oldWeight, denorm));
        }        
        _records[token].denorm = denorm;

        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;

        if (balance > oldBalance) {
            _pullUnderlying(token, msg.sender, bsub(balance, oldBalance));
        } else if( balance < oldBalance) {
            _pushUnderlying(token, msg.sender, bsub(oldBalance, balance));
        }
    }

    function unbind(address token)
        _logs_
        _lock_
        public
    {
        require(msg.sender == _controller, ERR_NOT_CONTROLLER);
        require(isBound(token), ERR_NOT_BOUND);

        _pushUnderlying(token, msg.sender, _records[token].balance);
        _totalWeight = bsub(_totalWeight, _records[token].denorm);

        // Swap the token-to-unbind with the last token,
        // then delete the last token
        uint index = _records[token].index - 1;
        uint last = _tokens.length - 1;
        _tokens[index] = _tokens[last];
        _records[_tokens[index]].index = index + 1;
        _tokens.pop();
        _records[token] = Record({
            index: 0
          , denorm: 0
          , balance: 0
        });
    }

    // Absorb any tokens that have been sent to this contract into the pool
    function gulp(address token)
      _logs_
      _lock_
      public
    {
        require(isBound(token), ERR_NOT_BOUND);
        _records[token].balance = ERC20(token).balanceOf(address(this));
    }

    function collect()
      _logs_
      _lock_
      public returns (uint collected)
    {
        require(msg.sender == _factory, ERR_NOT_FACTORY);
        uint fees = _balance[_factory];
        _pushPoolShare(_factory, fees);
        return (collected = fees);
    }

    function getSpotPrice(address Ti, address To)
      public view
        _viewlock_
        returns (uint P)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
    }

    function getSpotRate(address Ti, address To)
      public view
        _viewlock_
        returns (uint R)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotRate(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
    }

    function getSpotPriceSansFee(address Ti, address To)
      public view
        _viewlock_
        returns (uint P)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, 0);
    }

    function getSpotRateSansFee(address Ti, address To)
      public view
        _viewlock_
        returns (uint P)
    {
        require(isBound(Ti), ERR_NOT_BOUND);
        require(isBound(To), ERR_NOT_BOUND);
        Record storage I = _records[Ti];
        Record storage O = _records[To];
        return _calc_SpotRate(I.balance, I.denorm, O.balance, O.denorm, 0);
    }

    function joinPool(uint poolAo)
      public
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);
        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAo, poolTotal);
        for( uint i = 0; i < _tokens.length; i++ ) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tAi = bmul(ratio, bal);
            _records[t].balance = badd(_records[t].balance, tAi);
            _pullUnderlying(t, msg.sender, tAi);
        }
        _mintPoolShare(poolAo);
        _pushPoolShare(msg.sender, poolAo);
    }

    function exitPool(uint poolAi)
      public
        _logs_
        _lock_
    {
        require(_finalized, ERR_NOT_FINALIZED);

        uint poolTotal = totalSupply();
        uint ratio = bdiv(poolAi, poolTotal);
       
        _pullPoolShare(msg.sender, poolAi); 
        _burnPoolShare(poolAi);

        for( uint i = 0; i < _tokens.length; i++ ) {
            address t = _tokens[i];
            uint bal = _records[t].balance;
            uint tAo = bmul(ratio, bal);
            _records[t].balance = bsub(_records[t].balance, tAo);
            _pushUnderlying(t, msg.sender, tAo);
        }
    }


    function swap_ExactAmountIn(address Ti, uint Ai, address To, uint Lo, uint LP)
        _logs_
        _lock_
        public returns (uint Ao, uint MP)
    {
        
        require( isBound(Ti), ERR_NOT_BOUND );
        require( isBound(To), ERR_NOT_BOUND );
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require( Ai <= bmul(I.balance, MAX_IN_RATIO), ERR_MAX_IN_RATIO );

        uint SP0 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require( LP >= SP0, ERR_ARG_LIMIT_IN);

        Ao = _calc_OutGivenIn(I.balance, I.denorm, O.balance, O.denorm, Ai, _swapFee);
        require( Ao >= Lo, ERR_LIMIT_OUT );

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        uint SP1 = _calc_SpotPrice(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(SP1 <= LP, ERR_LIMIT_PRICE);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ao, SP1);
    }

    function swap_ExactAmountOut(address Ti, uint Li, address To, uint Ao, uint PL)
        _logs_
        _lock_ 
        public returns (uint Ai, uint MP)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO );

        uint SR0 = _calc_SpotRate(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(PL < SR0, ERR_ARG_LIMIT_PRICE );

        Ai = _calc_InGivenOut(I.balance, I.denorm, O.balance, O.denorm, Ao, _swapFee);
        require( Ai <= Li, ERR_LIMIT_IN);

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        uint SR1 = _calc_SpotRate(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require( SR1 >= PL, ERR_LIMIT_PRICE);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ai, SR1);
    }

    function swap_ExactMarginalPrice(address Ti, uint Li, address To, uint Lo, uint MP)
        _logs_
        _lock_
        public returns (uint Ai, uint Ao)
    {
        require( isBound(Ti), ERR_NOT_BOUND);
        require( isBound(To), ERR_NOT_BOUND);
        require( isPublicSwap(), ERR_SWAP_NOT_PUBLIC );

        Record storage I = _records[address(Ti)];
        Record storage O = _records[address(To)];

        require(Ao <= bmul(O.balance, MAX_OUT_RATIO), ERR_MAX_OUT_RATIO);

        uint SR0 = _calc_SpotRate(I.balance, I.denorm, O.balance, O.denorm, _swapFee);
        require(MP < SR0, ERR_ARG_LIMIT_PRICE);

        Ai = _calc_InGivenPrice( I.balance, I.denorm, O.balance, O.denorm, MP, _swapFee );
        Ao = _calc_OutGivenIn( I.balance, I.denorm, O.balance, O.denorm, Ai, _swapFee );

        require( Ai <= Li, ERR_LIMIT_IN);
        require( Ao >= Lo, ERR_LIMIT_OUT);

        I.balance = badd(I.balance, Ai);
        O.balance = bsub(O.balance, Ao);

        _pullUnderlying(Ti, msg.sender, Ai);
        _pushUnderlying(To, msg.sender, Ao);

        emit LOG_SWAP(msg.sender, Ti, To, Ai, Ao);

        return (Ai, Ao);
    }

    function joinswap_ExternAmountIn(address Ti, uint256 tAi)
      public
        _logs_
        _lock_
        returns (uint poolAo)
    {
        require( isBound(Ti), ERR_NOT_BOUND );
        uint oldPoolTotal = _totalSupply;

        Record storage T = _records[Ti];

        poolAo = _calc_PoolOutGivenSingleIn(T.balance, T.denorm, _totalSupply, _totalWeight, tAi, _swapFee);

        _mintPoolShare(poolAo);
        _pushPoolShare(msg.sender, poolAo);
        _pullUnderlying(Ti, msg.sender, tAi);
        T.balance = badd(T.balance, tAi);
        return poolAo;
    }

    function joinswap_PoolAmountOut(uint pAo, address Ti)
      public
        _logs_
        _lock_
        returns (uint tAi)
    {
        require( isBound(Ti), ERR_NOT_BOUND );

        Record storage T = _records[Ti];

        tAi = _calc_SingleInGivenPoolOut(T.balance, T.denorm, _totalSupply, _totalWeight, pAo, _swapFee);

        _mintPoolShare(pAo);
        _pushPoolShare(msg.sender, pAo);
        _pullUnderlying(Ti, msg.sender, tAi);
        T.balance = badd(T.balance, tAi);
        return tAi;
    }

    function exitswap_PoolAmountIn(uint pAi, address To)
      public
        _logs_
        _lock_
        returns (uint tAo)
    {
        require( isBound(To), ERR_NOT_BOUND );

        Record storage T = _records[To];

        tAo = _calc_SingleOutGivenPoolIn(T.balance, T.denorm, _totalSupply, _totalWeight, pAi, _swapFee, _exitFee);

        _pullPoolShare(msg.sender, pAi);
        _burnPoolShare(pAi);
        _pushUnderlying(To, msg.sender, tAo);
        T.balance = bsub(T.balance, tAo);
        return tAo;
    }

    function exitswap_ExternAmountOut(address To, uint tAo)
      public
        _logs_
        _lock_
        returns (uint pAi)
    {
        require( isBound(To), ERR_NOT_BOUND );

        Record storage T = _records[To];

        uint poolAoBeforeFees = _calc_PoolInGivenSingleOut(T.balance, T.denorm, _totalSupply, _totalWeight, tAo, _swapFee, _exitFee);
     
        _pullPoolShare(msg.sender, poolAoBeforeFees );  // Pull poolAoBeforeFees , not just poolAo 
        _burnPoolShare(poolAoBeforeFees);    
        _pushUnderlying(To, msg.sender, tAo);
        T.balance = bsub(T.balance, tAo);
        return poolAoBeforeFees;
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
