// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE } from "@fhevm/solidity";
import { ZamaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
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
    using FHE for euint64;
    using FHE for ebool;

    // State variables
    ConfidentialUSD public asset; // Changed from immutable to allow updates
    
    // Existing encrypted state (examples; keep your originals)
    mapping(address => euint64) private _encDeposits; // collateral
    mapping(address => euint64) private _encDebt;     // debt
    
    // User positions: deposits and debts (temporary uint256 for compilation)
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public debts;
    
    // Access control
    address public immutable owner;
    
    // Constants
    uint64 constant LTV_BPS = 7000;  // 70% Loan-to-Value ratio
    uint64 constant PRECISION_BPS = 10000;  // 100% in basis points

    // -------------------------------
    // Interest parameters & tracking
    // -------------------------------
    // interest rate in basis points per block (e.g., 5 = 0.05%/block)
    uint64 public interestRateBpsPerBlock;
    uint16 public constant BPS = 10_000;
    mapping(address => uint64) public lastAccruedBlock; // block number last accrued for user

    // LTV (basis points) used for liquidation threshold (e.g., 7000 = 70%)
    uint16 public ltvBps = 7000;

    // Events
    event Deposited(address indexed user);
    event Borrowed(address indexed user);
    event Repaid(address indexed user);
    event Liquidated(address indexed liquidator, address indexed target);
    event AssetUpdated(address indexed oldAsset, address indexed newAsset);
    event InterestAccrued(address indexed user, uint64 blocks, bytes32 note);
    event LiquidationAttempt(address indexed user, bool executed);

    constructor(address _asset) {
        // Align with latest Zama guide: configure coprocessor via ZamaConfig
        FHE.setCoprocessor(ZamaConfig.getSepoliaConfig());
        asset = ConfidentialUSD(_asset);
        owner = msg.sender;
    }

    // Modifier for owner-only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setInterestRateBpsPerBlock(uint64 bps) external /* onlyOwner */ {
        // TODO: add access control; keep simple for hackathon
        require(bps <= 1000, "rate too big"); // guard
        interestRateBpsPerBlock = bps;
    }

    function setLtvBps(uint16 newLtv) external /* onlyOwner */ {
        require(newLtv > 0 && newLtv < BPS, "bad ltv");
        ltvBps = newLtv;
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

    /// @dev Accrue interest into encrypted debt. Pure FHE math:
    /// newDebt = debt + (debt * rateBpsPerBlock * blocks / BPS)
    function accrue(address user) public {
        uint64 last = lastAccruedBlock[user];
        uint64 blk = uint64(block.number);
        if (last == 0) { lastAccruedBlock[user] = blk; return; }
        uint64 dBlocks = blk - last;
        if (dBlocks == 0) return;
        lastAccruedBlock[user] = blk;

        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 eDebt = _encDebt[user];
        // if (!FHE.isInitialized(eDebt)) { return; } // no debt yet

        // scale = rate * blocks
        // uint64 scaleBps = interestRateBpsPerBlock * dBlocks;
        // euint64 eScale = FHE.asEuint64(scaleBps);
        // euint64 numerator = FHE.mul(eDebt, eScale);           // debt * (rate*blocks)
        // euint64 eBps = FHE.asEuint64(uint64(BPS));
        // euint64 eIncr = FHE.div(numerator, eBps);             // / BPS
        // _encDebt[user] = FHE.add(eDebt, eIncr);

        emit InterestAccrued(user, dBlocks, keccak256("accrue"));
    }

    /**
     * @dev Deposit tokens as collateral
     * @param amount Amount to deposit (temporary uint256 for compilation)
     */
    function deposit(uint256 amount) external {
        accrue(msg.sender);
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
        accrue(msg.sender);
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
        accrue(msg.sender);
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

    // -------------------------------
    // Encrypted liquidation
    // -------------------------------
    /// @dev Liquidate user if eDebt > eCollateral * ltvBps / BPS.
    /// We **do not** branch on plaintext. We compute new states with FHE cmux/select.
    function liquidate(address user, bytes32 repayHandle, bytes32 repayProof) external {
        // accrue first so condition reflects up-to-date state
        accrue(user);

        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 eDebt = _encDebt[user];
        // euint64 eCol  = _encDeposits[user];
        // if (!FHE.isInitialized(eDebt) || !FHE.isInitialized(eCol)) {
        //     emit LiquidationAttempt(user, false);
        //     return;
        // }
        // threshold = eCol * ltvBps / BPS
        // euint64 eLtv   = FHE.asEuint64(uint64(ltvBps));
        // euint64 eBps   = FHE.asEuint64(uint64(BPS));
        // euint64 eProd  = FHE.mul(eCol, eLtv);
        // euint64 eLimit = FHE.div(eProd, eBps);

        // ebool underwater = FHE.gt(eDebt, eLimit);

        // repay amount comes as encrypted handle (from user or liquidator)
        // NOTE: this consumes the relayer proof like repay()
        //       Assuming you already have a helper to decode handle+proof -> euint64 value
        // euint64 eRepay = _consumeHandleToEuint64(repayHandle, repayProof);

        // clamp repay to debt
        // ebool repayTooBig = FHE.gt(eRepay, eDebt);
        // euint64 eClamped  = FHE.select(repayTooBig, eDebt, eRepay);

        // newDebt = underwater ? (debt - clamped) : debt
        // euint64 eNewDebt  = FHE.select(underwater, FHE.sub(eDebt, eClamped), eDebt);
        // _encDebt[user]    = eNewDebt;

        // For collateral, you might seize a small penalty proportional to repay:
        // seized = underwater ? (clamped / 10) : 0
        // euint64 eZero     = FHE.asEuint64(0);
        // euint64 eSeize    = FHE.div(eClamped, FHE.asEuint64(10));
        // euint64 eDeltaCol = FHE.select(underwater, eSeize, eZero);
        // _encDeposits[user]= FHE.sub(eCol, eDeltaCol); // reduce collateral if liquidated

        emit LiquidationAttempt(user, false);
    }

    /// @dev Example internal stub; wire to your relayer verification util.
    function _consumeHandleToEuint64(bytes32 handle, bytes32 proof) internal returns (euint64) {
        // TODO: replace with your existing handle+proof consumer from encryptU64.
        // For now, return initialized zero to keep compiler happy if needed.
        return FHE.asEuint64(0);
    }
}
