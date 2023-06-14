// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Farming {
    address public owner;
    IERC20 public tokenA;
    IERC20 public tokenB;
    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;
    mapping(address => uint) public balanceOf;
    uint public secondsReward;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    constructor(address _tokenA, address _tokenB, uint _secondsReward) {
        owner = msg.sender;
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        secondsReward = _secondsReward;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    function rewardPerToken() internal view returns (uint) {
        if (totalDeposits() == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + (secondsReward * (block.timestamp - lastUpdateTime) * 1e18) / totalDeposits();
    }

    function totalDeposits() public view returns (uint) {
        return tokenB.balanceOf(address(this));
    }

    function depositTokenA(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenA.transferFrom(owner, address(this), amount), "transfer fail");
    }

    function depositTokenB(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        require(tokenB.transferFrom(msg.sender, address(this), _amount), "transfer fail");
        balanceOf[msg.sender] += _amount;
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount must be greater than zero");
        require(balanceOf[msg.sender] >= _amount, "Incorrect balance");
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(tokenA.transfer(msg.sender, reward), "transfer fail");
        }
        balanceOf[msg.sender] -= _amount;
        require(tokenB.transfer(msg.sender, _amount), "transfer fail");
    }

    function earned(address _account) public view returns (uint) {
        return ((balanceOf[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) + rewards[_account];
    }
}