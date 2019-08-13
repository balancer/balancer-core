pragma solidity ^0.5.10;

import 'erc20/erc20.sol';
import 'ds-note/note.sol';
import 'ds-token/token.sol';
import 'erc20/erc20.sol';

import "./BalancerMath.sol";

contract BalancerPool is BalancerMath
                       , DSNote
{
    bool                      public paused;
    address                   public manager;
    uint256                   public feeRatio;
    uint256                   public unclaimedFees;

    mapping(address=>Record)  public records;

    event Swap( address indexed sender
              , address indexed Ti
              , uint256         Ai
              , address indexed To
              , uint256         Ao
              , bool            variant
              , uint256         fee
              );

    struct Record {
        bool    bound;
        ERC20   addr;
        uint256 weight;  // RAY
        uint256 balance; // WAD
    }

    constructor() public {
        manager = msg.sender;
        paused = true;
    }

    function swapI(ERC20 Ti, uint256 Ai, ERC20 To)
        public returns (uint256 Ao)
    {
        require( ! paused);
        require(isBound(Ti), "Token-in not bound");
        require(isBound(To), "Token-out not bound");
        Record storage I = records[address(Ti)];
        Record storage O = records[address(To)];

        uint256 trueIn = wsub(Ai, wmul(Ai, feeRatio));
    
        Ao = swapImath( I.balance, I.weight
                             , O.balance, O.weight
                             , trueIn, feeRatio );

        ERC20(Ti).transferFrom(msg.sender, address(this), Ai);
        ERC20(To).transfer(msg.sender, Ao);
        return Ao;
    }
    function swapO(ERC20 Ti, ERC20 To, uint256 Ao)
        public returns (uint256 Ai)
    {
        revert("unimplemented");
    }

    function setFee(uint256 feeRatio_)
        note
        public
    {
        require(msg.sender == manager);
        feeRatio = feeRatio_;
    }
    function setParams(ERC20 token, uint256 weight, uint256 balance)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        records[address(token)].weight = weight;
        uint256 oldBalance = records[address(token)].balance;
        records[address(token)].balance = balance;
        token.transferFrom(msg.sender, address(this), balance);
/*
        if (balance > oldBalance) {
            token.transferFrom(msg.sender, address(this), balance - oldBalance);
        } else {
            token.transfer(msg.sender, oldBalance - balance);
        }
*/
    }

    function isBound(ERC20 token) public view returns (bool) {
        return records[address(token)].bound;
    }

    function bind(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require( ! isBound(token));
        records[address(token)] = Record({
            addr: token
          , bound: true
          , weight: 0
          , balance: 0
        });
    }
    function unbind(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        require(token.balanceOf(address(this)) == 0); // use `setWeight` and `sweep`
        delete records[address(token)];
    }
    // Collect fees and any excess token that may have been transferred in
    function sweep(ERC20 token)
        note
        public
    {
        require(msg.sender == manager);
        require(isBound(token));
        uint256 selfBalance = records[address(token)].balance;
        uint256 trueBalance = token.balanceOf(address(this));
        token.transfer(msg.sender, trueBalance - selfBalance);
    }
    function pause()
        note
        public
    {
        assert(msg.sender == manager);
        paused = true;
    }
    function start()
        note
        public
    {
        assert(msg.sender == manager);
        paused = false;
    }
}
