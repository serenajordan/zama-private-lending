// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "@fhevm/solidity/lib/FHE.sol";
import "./ConfidentialUSD.sol";

/**
 * @title PrivateLendingPool
 * @dev A confidential lending pool built on Zama fhEVM
 * All deposits, debts, and operations are encrypted and private
 */
contract PrivateLendingPool {
    using FHE for *;

    // State variables
    ConfidentialUSD public immutable asset;
    
    // User positions: encrypted deposits and debts
    mapping(address => euint64) public deposits;
    mapping(address => euint64) public debts;
    
    // Constants
    uint64 constant LTV_BPS = 7000;  // 70% Loan-to-Value ratio
    uint64 constant PRECISION_BPS = 10000;  // 100% in basis points

    // Events
    event Deposit(address indexed user, euint64 amount);
    event Borrow(address indexed user, euint64 amount);
    event Repay(address indexed user, euint64 amount);

    constructor(address _asset) {
        asset = ConfidentialUSD(_asset);
    }

    /**
     * @dev Deposit encrypted tokens as collateral
     * @param encAmt Encrypted amount to deposit
     * @param proof Zero-knowledge proof for the amount
     */
    function deposit(
        externalEuint64 calldata encAmt,
        bytes calldata proof
    ) external {
        require(FHE.isSenderAllowed(encAmt), "Not allowed");
        
        euint64 amt = FHE.fromExternal(encAmt, proof);
        amt.allowThis();
        amt.allowTransient(address(asset));
        
        // Pull tokens from user to pool
        asset.pull(msg.sender, address(this), amt);
        
        // Update user's deposit
        deposits[msg.sender] = FHE.add(deposits[msg.sender], amt);
        deposits[msg.sender].allowThis();
        deposits[msg.sender].allow(msg.sender);
        
        emit Deposit(msg.sender, amt);
    }

    /**
     * @dev Borrow against deposited collateral
     * @param encReq Encrypted requested amount
     * @param proof Zero-knowledge proof for the amount
     */
    function borrow(
        externalEuint64 calldata encReq,
        bytes calldata proof
    ) external {
        euint64 req = FHE.fromExternal(encReq, proof);
        req.allowThis();
        
        // Calculate borrowing capacity: deposit * LTV / PRECISION
        euint64 cap = FHE.div(
            FHE.mul(deposits[msg.sender], FHE.asEuint64(LTV_BPS)),
            FHE.asEuint64(PRECISION_BPS)
        );
        cap.allowThis();
        
        // Check if user has available borrowing capacity
        ebool hasCapacity = FHE.le(debts[msg.sender], cap);
        
        // Calculate maximum available to borrow
        euint64 maxAvailable = FHE.select(
            hasCapacity,
            FHE.sub(cap, debts[msg.sender]),
            FHE.asEuint64(0)
        );
        maxAvailable.allowThis();
        
        // Determine actual borrow amount (min of request and available)
        ebool withinLimit = FHE.le(req, maxAvailable);
        euint64 borrowAmount = FHE.select(withinLimit, req, maxAvailable);
        borrowAmount.allowThis();
        
        // Update user's debt
        debts[msg.sender] = FHE.add(debts[msg.sender], borrowAmount);
        debts[msg.sender].allowThis();
        debts[msg.sender].allow(msg.sender);
        
        // Transfer tokens to user
        asset.push(address(this), msg.sender, borrowAmount);
        
        emit Borrow(msg.sender, borrowAmount);
    }

    /**
     * @dev Repay borrowed amount
     * @param encAmt Encrypted amount to repay
     * @param proof Zero-knowledge proof for the amount
     */
    function repay(
        externalEuint64 calldata encAmt,
        bytes calldata proof
    ) external {
        require(FHE.isSenderAllowed(encAmt), "Not allowed");
        
        euint64 amt = FHE.fromExternal(encAmt, proof);
        amt.allowThis();
        amt.allowTransient(address(asset));
        
        // Calculate actual repayment amount (min of amount and debt)
        ebool canRepayAll = FHE.le(amt, debts[msg.sender]);
        euint64 repayAmount = FHE.select(canRepayAll, amt, debts[msg.sender]);
        repayAmount.allowThis();
        
        // Pull tokens from user
        asset.pull(msg.sender, address(this), repayAmount);
        
        // Update user's debt
        debts[msg.sender] = FHE.sub(debts[msg.sender], repayAmount);
        debts[msg.sender].allowThis();
        debts[msg.sender].allow(msg.sender);
        
        emit Repay(msg.sender, repayAmount);
    }

    /**
     * @dev View user's encrypted position
     * @return Encrypted deposit amount
     * @return Encrypted debt amount
     */
    function viewMyPosition() external view returns (euint64, euint64) {
        return (deposits[msg.sender], debts[msg.sender]);
    }

    /**
     * @dev Calculate user's health factor (deposit * LTV >= debt)
     * @param user Address to check
     * @return Encrypted health factor (true if healthy)
     */
    function getHealthFactor(address user) external view returns (ebool) {
        euint64 borrowingCapacity = FHE.div(
            FHE.mul(deposits[user], FHE.asEuint64(LTV_BPS)),
            FHE.asEuint64(PRECISION_BPS)
        );
        
        return FHE.le(debts[user], borrowingCapacity);
    }
}
