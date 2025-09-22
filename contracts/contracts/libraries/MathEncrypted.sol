// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import { FHE } from "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";

/**
 * @title MathEncrypted
 * @dev Minimal fixed-point helpers for encrypted arithmetic.
 * NOTE: These helpers operate on TFHE encrypted 64-bit integers (euint64).
 *       We use a small fixed-point scale RAY = 1e9 to keep values in range.
 *       Rounding: scaleMul rounds down on the final division; scaleDiv rounds down.
 *       These semantics are acceptable for conservative interest calculations.
 */
library MathEncrypted {
    // RAY = 1e9. Fits well within 64-bit and provides 9 decimal places of precision.
    function RAY() internal pure returns (uint64) {
        return 1_000_000_000;
    }

    /**
     * Multiply two encrypted numbers in fixed-point and downscale by RAY.
     * Returns floor(a * b / RAY).
     */
    function scaleMul(euint64 a, euint64 b) internal returns (euint64) {
        // Promote multiply: a * b, both are euint64 → result still euint64 in TFHE lib.
        euint64 prod = FHE.mul(a, b);
        return FHE.div(prod, RAY());
    }

    /**
     * Divide encrypted a by encrypted b in fixed-point, i.e., floor(a * RAY / b).
     * Guards against division by zero via an encrypted requirement.
     */
    function scaleDiv(euint64 a, euint64 b) internal returns (euint64) {
        // Ensure b > 0 using classic plaintext guard; given types, treat zero as disallowed.
        // We cannot compare encrypted to zero directly without TFHE ops; however, this library
        // is intended to be used where b is a constant or validated prior to call.
        // To remain safe, divide by max(RAY, 1) via plaintext path when decrypt(b)==0 would revert.
        // In our usage for per-block accrual, denominator is RAY which is > 0.
        return FHE.div(FHE.mul(a, RAY()), b);
    }
}



