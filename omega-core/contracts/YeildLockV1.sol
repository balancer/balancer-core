pragma solidity ^0.6.0;

import "./USDii.sol";

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract YeildLockV1 {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;
    
     uint256 public releaseTime = 120;

    // timestamp when token release is enabled
    uint256 private _releaseTime;
    
    address public owner;
    
    uint256 public createdAt;

    constructor (IERC20 token, address beneficiary) public {
        // solhint-disable-next-line not-rely-on-time
        require(releaseTime > block.timestamp, "TokenTimelock: release time is before current time");
        _token = token;
        _beneficiary = beneficiary;
        _releaseTime = releaseTime;
    }
    
        modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
        receive()  payable external{
        emit Received(msg.sender, msg.value);
    }
    


    function info() public view returns(address, uint256, uint256, uint256) {
        return (owner, _releaseTime, createdAt, address(this).balance);
    }

    event Received(address from, uint256 amount);

    event WithdrewTokens(address tokenContract, address to, uint256 amount);

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }
    
        function TimeLocked(
    ) public {
        owner = msg.sender;
        createdAt = block.timestamp;
    }
    
    /*
     * @dev Locks a specified amount of tokens against an address,
     *      for a specified reason and time
     * @param _reason The reason to lock tokens
     * @param _amount Number of tokens to be locked
     * @param _time Lock time in seconds
     */

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view returns (address) {
        return _beneficiary;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() public virtual {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= _releaseTime, "TokenTimelock: current time is before release time");

        uint256 amount = _token.balanceOf(address(this));
        require(amount > 0, "TokenTimelock: no tokens to release");

        _token.safeTransfer(_beneficiary, amount);
    }
    
    event Withdrew(address to, uint256 amount);
    
        // callable by owner only, after specified time
    function withdraw() public {
       require(block.timestamp >= _releaseTime);
       
       //now send all the balance
       msg.sender.transfer(address(this).balance);
       emit Withdrew(msg.sender, address(this).balance);
    }
}