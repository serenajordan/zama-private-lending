// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import "encrypted-types/EncryptedTypes.sol";
import { TFHE } from "../utils/TFHEOps.sol";

/**
 * @title MathEncrypted
 * @dev Minimal fixed-point helpers for encrypted arithmetic.
 * NOTE: These helpers operate on TFHE encrypted 64 bit integers (type euint64).
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
        euint64 prod = TFHE.mul(a, b);
        return TFHE.div(prod, RAY());
    }

    /**
     * Divide encrypted a by encrypted b in fixed-point, i.e., floor(a * RAY / b).
     * Guards against division by zero via an encrypted requirement.
     */
    function scaleDiv(euint64 a, uint64 b) internal returns (euint64) {
        require(b > 0, "MathEncrypted: division by zero");
        return TFHE.div(TFHE.mul(a, RAY()), b);
    }
}



