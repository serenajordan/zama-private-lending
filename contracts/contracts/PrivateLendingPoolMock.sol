// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import "./ConfidentialUSD.sol";

/**
 * @title PrivateLendingPoolMock
 * @dev Simplified lending pool for testing on regular EVM networks
 */
contract PrivateLendingPoolMock {
    ConfidentialUSD public token;
    address public priceFeed;

    mapping(address => uint256) private deposits;
    mapping(address => uint256) private debts;

    uint256 public constant MAX_LTV = 7000; // 70% in basis points
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% in basis points

    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Liquidation(address indexed liquidator, address indexed borrower, uint256 amount);

    constructor(address _token, address _priceFeed) {
        token = ConfidentialUSD(_token);
        priceFeed = _priceFeed;
    }

    function deposit(uint256 amount) external {
        deposits[msg.sender] += amount;
        // Mock token transfer - in real implementation this would be encrypted
        emit Deposit(msg.sender, amount);
    }

    function borrow(uint256 amount) external {
        require(deposits[msg.sender] > 0, "No deposits");
        require(debts[msg.sender] + amount <= (deposits[msg.sender] * MAX_LTV) / 10000, "Exceeds LTV");
        
        debts[msg.sender] += amount;
        emit Borrow(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount <= debts[msg.sender], "Exceeds debt");
        debts[msg.sender] -= amount;
        emit Repay(msg.sender, amount);
    }

    function liquidate(address borrower, uint256 amount) external {
        require(canLiquidate(borrower), "Cannot liquidate");
        require(amount <= debts[borrower], "Exceeds debt");
        
        debts[borrower] -= amount;
        deposits[borrower] -= amount;
        emit Liquidation(msg.sender, borrower, amount);
    }

    function canLiquidate(address borrower) public view returns (bool) {
        if (deposits[borrower] == 0) return false;
        return debts[borrower] > (deposits[borrower] * LIQUIDATION_THRESHOLD) / 10000;
    }

    function viewMyPosition() external view returns (uint256, uint256) {
        return (deposits[msg.sender], debts[msg.sender]);
    }

    function getHealthFactor(address user) external view returns (uint256) {
        if (deposits[user] == 0) return 0;
        return (deposits[user] * 10000) / (debts[user] + 1); // Avoid division by zero
    }

    function getPoolStats() external view returns (uint256, uint256) {
        // Mock implementation
        return (0, 0);
    }
}

