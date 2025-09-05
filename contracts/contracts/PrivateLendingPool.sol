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
    event Deposited(address indexed user);
    event Borrowed(address indexed user);
    event Repaid(address indexed user);
    event Liquidated(address indexed liquidator, address indexed target);
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
        
        emit Deposited(msg.sender);
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
        
        emit Borrowed(msg.sender);
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
        
        emit Repaid(msg.sender);
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

    /**
     * @dev Simple soft liquidation function
     * @param target Address to liquidate
     * @param encRepay Encrypted repayment amount
     * @param proof Proof for encrypted amount
     */
    function liquidateSimple(address target, uint256 encRepay, bytes calldata proof) external {
        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // health: debt > cap
        // euint64 cap = FHE.div(FHE.mul(deposits[target], FHE.asEuint64(LTV_BPS)), FHE.asEuint64(PRECISION_BPS));
        // ebool unhealthy = FHE.gt(debts[target], cap);

        // euint64 repay = FHE.fromExternal(encRepay, proof);
        // repay.allowThis(); 
        // repay.allowTransient(address(asset));

        // allowed = unhealthy ? min(repay, debt[target]) : 0
        // euint64 allowed = FHE.select(unhealthy, FHE.select(FHE.le(repay, debts[target]), repay, debts[target]), FHE.asEuint64(0));

        // asset.pull(msg.sender, address(this), allowed);
        // debts[target] = FHE.sub(debts[target], allowed);
        // debts[target].allowThis();

        // For now, simplified version without FHEVM
        uint256 cap = (deposits[target] * LTV_BPS) / PRECISION_BPS;
        bool unhealthy = debts[target] > cap;
        
        if (unhealthy) {
            uint256 allowed = encRepay <= debts[target] ? encRepay : debts[target];
            asset.pull(msg.sender, address(this), allowed);
            debts[target] -= allowed;
        }

        emit Liquidated(msg.sender, target);
    }
}
