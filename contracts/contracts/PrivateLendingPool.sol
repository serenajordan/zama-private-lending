// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

// TODO: Re-enable FHEVM imports once version compatibility is resolved
// import "@fhevm/solidity/config/FHEVMConfig.sol";
// import "@fhevm/solidity/lib/FHE.sol";
import "./ConfidentialUSD.sol";

/**
 * @title PrivateLendingPool
 * @dev A confidential lending pool built on Zama fhEVM
 * All deposits, debts, and operations are encrypted and private
 * 
 * NOTE: This is a simplified version for initial compilation.
 * FHEVM integration will be added once version compatibility is resolved.
 */
contract PrivateLendingPool {
    // TODO: Re-enable FHEVM types once version compatibility is resolved
    // using FHE for *;

    // State variables
    ConfidentialUSD public asset; // Changed from immutable to allow updates
    
    // User positions: deposits and debts (temporary uint256 for compilation)
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public debts;
    
    // Access control
    address public immutable owner;
    
    // Constants
    uint64 constant LTV_BPS = 7000;  // 70% Loan-to-Value ratio
    uint64 constant PRECISION_BPS = 10000;  // 100% in basis points

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event AssetUpdated(address indexed oldAsset, address indexed newAsset);

    constructor(address _asset) {
        asset = ConfidentialUSD(_asset);
        owner = msg.sender;
    }

    // Modifier for owner-only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Update the asset address (owner only)
     * @param newAsset New asset address
     */
    function updateAsset(address newAsset) external onlyOwner {
        require(newAsset != address(0), "Invalid asset address");
        address oldAsset = address(asset);
        asset = ConfidentialUSD(newAsset);
        emit AssetUpdated(oldAsset, newAsset);
    }

    /**
     * @dev Deposit tokens as collateral
     * @param amount Amount to deposit (temporary uint256 for compilation)
     */
    function deposit(uint256 amount) external {
        // TODO: Re-enable FHEVM validation once version compatibility is resolved
        // require(FHE.isSenderAllowed(amount), "Not allowed");
        
        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 amt = FHE.fromExternal(amount, proof);
        // amt.allowThis();
        // amt.allowTransient(address(asset));
        
        // Pull tokens from user to pool
        asset.pull(msg.sender, address(this), amount);
        
        // Update user's deposit
        deposits[msg.sender] += amount;
        
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Borrow against deposited collateral
     * @param req Requested amount (temporary uint256 for compilation)
     */
    function borrow(uint256 req) external {
        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 req = FHE.fromExternal(encReq, proof);
        // req.allowThis();
        
        // Calculate borrowing capacity: deposit * LTV / PRECISION
        uint256 cap = (deposits[msg.sender] * LTV_BPS) / PRECISION_BPS;
        
        // Check if user has available borrowing capacity
        require(debts[msg.sender] <= cap, "Insufficient borrowing capacity");
        
        // Calculate maximum available to borrow
        uint256 maxAvailable = cap - debts[msg.sender];
        
        // Determine actual borrow amount (min of request and available)
        uint256 borrowAmount = req <= maxAvailable ? req : maxAvailable;
        
        // Update user's debt
        debts[msg.sender] += borrowAmount;
        
        // Transfer tokens to user
        asset.push(address(this), msg.sender, borrowAmount);
        
        emit Borrow(msg.sender, borrowAmount);
    }

    /**
     * @dev Repay borrowed amount
     * @param amount Amount to repay (temporary uint256 for compilation)
     */
    function repay(uint256 amount) external {
        // TODO: Re-enable FHEVM validation once version compatibility is resolved
        // require(FHE.isSenderAllowed(amount), "Not allowed");
        
        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 amt = FHE.fromExternal(encAmt, proof);
        // amt.allowThis();
        // amt.allowTransient(address(asset));
        
        // Calculate actual repayment amount (min of amount and debt)
        uint256 repayAmount = amount <= debts[msg.sender] ? amount : debts[msg.sender];
        
        // Pull tokens from user
        asset.pull(msg.sender, address(this), repayAmount);
        
        // Update user's debt
        debts[msg.sender] -= repayAmount;
        
        emit Repay(msg.sender, repayAmount);
    }

    /**
     * @dev View user's position
     * @return Deposit amount
     * @return Debt amount
     */
    function viewMyPosition() external view returns (uint256, uint256) {
        return (deposits[msg.sender], debts[msg.sender]);
    }

    /**
     * @dev Calculate user's health factor (deposit * LTV >= debt)
     * @param user Address to check
     * @return Health factor (true if healthy)
     */
    function getHealthFactor(address user) external view returns (bool) {
        uint256 borrowingCapacity = (deposits[user] * LTV_BPS) / PRECISION_BPS;
        
        return debts[user] <= borrowingCapacity;
    }
}
