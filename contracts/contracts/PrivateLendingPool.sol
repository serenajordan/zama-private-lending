// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import "encrypted-types/EncryptedTypes.sol";
import "./ConfidentialUSD.sol";
import { TFHE } from "./utils/TFHEOps.sol";
import { MathEncrypted } from "./libraries/MathEncrypted.sol";

/**
 * @title PrivateLendingPool
 * @dev Confidential lending pool ensuring all sensitive values stay encrypted.
 * Deposits, debts, and health checks are handled through TFHE operations only.
 */
contract PrivateLendingPool {
    ConfidentialUSD public token;

    mapping(address => euint64) private deposits;
    mapping(address => euint64) private debts;
    // Encrypted per-block interest rate in RAY (1e9) fixed-point.
    euint64 private ratePerBlockRay;

    uint64 private constant BASIS_POINTS = 10_000;
    uint64 public constant MAX_LTV_BPS = 7_000;
    uint64 public constant LIQUIDATION_THRESHOLD_BPS = 8_000;
    uint64 public constant LIQUIDATION_BONUS_BPS = 11_000;

    event Deposit(address indexed user, bytes32 encryptedAmount);
    event Borrow(address indexed user, bytes32 encryptedAmount);
    event Repay(address indexed user, bytes32 encryptedAmount);
    event Liquidation(address indexed liquidator, address indexed borrower, bytes32 encryptedAmount);
    event InterestAccrued(address indexed user, bytes32 rateBps);

    constructor(address _token) {
        token = ConfidentialUSD(_token);
        // Default rate 0
        ratePerBlockRay = TFHE.asEuint64(uint64(0));
    }

    /**
     * @dev Deposit encrypted collateral into the pool.
     */
    function deposit(bytes32 amount) external {
        euint64 encryptedAmount = TFHE.asEuint64(amount);
        deposits[msg.sender] = TFHE.add(deposits[msg.sender], encryptedAmount);

        // Token transfer mocked until FHE-compatible token plumbing is restored.
        // token.transferFromEncrypted(msg.sender, address(this), amount);

        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Borrow against encrypted collateral, enforcing MAX_LTV_BPS cap.
     */
    function borrow(bytes32 amount) external {
        _accrue(msg.sender);
        euint64 encryptedAmount = TFHE.asEuint64(amount);
        euint64 userDeposits = deposits[msg.sender];
        euint64 userDebt = debts[msg.sender];

        euint64 newDebt = TFHE.add(userDebt, encryptedAmount);
        euint64 maxBorrow = _maxBorrow(userDeposits);
        ebool canBorrow = TFHE.lte(newDebt, maxBorrow);

        TFHE.req(canBorrow, "Insufficient collateral");
        debts[msg.sender] = TFHE.cmux(canBorrow, newDebt, userDebt);

        // token.transferEncrypted(msg.sender, amount);

        emit Borrow(msg.sender, amount);
    }

    /**
     * @dev Repay encrypted debt without ever allowing a negative balance.
     */
    function repay(bytes32 amount) external {
        _accrue(msg.sender);
        euint64 encryptedAmount = TFHE.asEuint64(amount);
        euint64 userDebt = debts[msg.sender];

        ebool validRepayment = TFHE.lte(encryptedAmount, userDebt);
        TFHE.req(validRepayment, "Repaying more than owed");

        euint64 newDebt = TFHE.sub(userDebt, encryptedAmount);
        debts[msg.sender] = TFHE.cmux(validRepayment, newDebt, userDebt);

        // token.transferFromEncrypted(msg.sender, address(this), amount);

        emit Repay(msg.sender, amount);
    }

    /**
     * @dev Accrue interest for a user by an encrypted basis-point rate.
     * @param user Address of the borrower whose debt accrues interest.
     * @param rateBps Encrypted basis points to apply (e.g. 100 = 1%).
     */
    function accrueInterest(address user, bytes32 rateBps) external {
        euint64 userDebt = debts[user];
        euint64 rate = TFHE.asEuint64(rateBps);

        euint64 interest = TFHE.div(TFHE.mul(userDebt, rate), BASIS_POINTS);
        euint64 newDebt = TFHE.add(userDebt, interest);
        debts[user] = newDebt;

        emit InterestAccrued(user, rateBps);
    }

    /**
     * @dev Set the encrypted per-block interest rate (RAY scaled). For demo, accept plaintext uint64.
     */
    function setRatePerBlock(uint64 rayScaled) external {
        ratePerBlockRay = TFHE.asEuint64(rayScaled);
    }

    /**
     * @dev Accrue per-block interest onto user's debt using RAY fixed-point helpers.
     * newDebt = (oldDebt * (RAY + rate)) / RAY
     */
    function _accrue(address user) private {
        euint64 oldDebt = debts[user];
        ebool hasDebt = TFHE.gt(oldDebt, TFHE.asEuint64(0));
        euint64 onePlusRate = TFHE.add(ratePerBlockRay, MathEncrypted.RAY());
        euint64 tmp = MathEncrypted.scaleMul(oldDebt, onePlusRate);
        euint64 newDebt = MathEncrypted.scaleDiv(tmp, MathEncrypted.RAY());
        debts[user] = TFHE.cmux(hasDebt, newDebt, oldDebt);
    }

    /**
     * @dev Liquidate an unhealthy position using encrypted conditions only.
     */
    function liquidate(address borrower, bytes32 repayAmount) external {
        euint64 encryptedRepayAmount = TFHE.asEuint64(repayAmount);
        euint64 borrowerDebt = debts[borrower];
        euint64 borrowerDeposits = deposits[borrower];

        ebool liquidatable = _isLiquidatable(borrowerDeposits, borrowerDebt);
        TFHE.req(liquidatable, "Position healthy");

        ebool repayWithinDebt = TFHE.lte(encryptedRepayAmount, borrowerDebt);
        TFHE.req(repayWithinDebt, "Repay amount exceeds debt");

        euint64 collateralToSeize = TFHE.div(
            TFHE.mul(encryptedRepayAmount, LIQUIDATION_BONUS_BPS),
            BASIS_POINTS
        );

        ebool sufficientCollateral = TFHE.lte(collateralToSeize, borrowerDeposits);
        TFHE.req(sufficientCollateral, "Insufficient collateral");

        debts[borrower] = TFHE.cmux(repayWithinDebt, TFHE.sub(borrowerDebt, encryptedRepayAmount), borrowerDebt);
        deposits[borrower] = TFHE.cmux(
            sufficientCollateral,
            TFHE.sub(borrowerDeposits, collateralToSeize),
            borrowerDeposits
        );

        deposits[msg.sender] = TFHE.add(deposits[msg.sender], collateralToSeize);

        // token.transferFromEncrypted(msg.sender, address(this), repayAmount);

        emit Liquidation(msg.sender, borrower, repayAmount);
    }

    /**
     * @dev Return caller's encrypted position for off-chain inspection.
     */
    function viewMyPosition() external view returns (bytes32, bytes32) {
        return _peekPosition(msg.sender);
    }

    /**
     * @dev Return a user's encrypted position for testing and analytics.
     */
    function peekPosition(address user) external view returns (bytes32, bytes32) {
        return _peekPosition(user);
    }

    function _peekPosition(address user) private view returns (bytes32, bytes32) {
        return (euint64.unwrap(deposits[user]), euint64.unwrap(debts[user]));
    }

    function _maxBorrow(euint64 userDeposits) private returns (euint64) {
        return TFHE.div(TFHE.mul(userDeposits, MAX_LTV_BPS), BASIS_POINTS);
    }

    function _isLiquidatable(euint64 userDeposits, euint64 userDebt) private returns (ebool) {
        euint64 lhs = TFHE.mul(userDeposits, LIQUIDATION_THRESHOLD_BPS);
        euint64 rhs = TFHE.mul(userDebt, BASIS_POINTS);
        return TFHE.lt(lhs, rhs);
    }
}
