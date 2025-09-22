// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import "encrypted-types/EncryptedTypes.sol";
import { TFHE } from "../utils/TFHEOps.sol";

interface IAccessControlLike {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

/**
 * @title PriceFeedEncrypted
 * @dev Minimal encrypted price feed with role-gated updates and re-encryption for viewers.
 */
contract PriceFeedEncrypted {
    // Optional AccessControl-like contract. If zero, anyone can set (for tests).
    IAccessControlLike public accessControl;
    bytes32 public constant PRICE_FEEDER = keccak256("PRICE_FEEDER");

    // Encrypted price (scaled, e.g., 1e9 = 1.0 if using RAY semantics)
    euint64 private _price;

    event PriceUpdated(bytes32 ciphertext);

    constructor(address accessControlContract) {
        accessControl = IAccessControlLike(accessControlContract);
        _price = TFHE.asEuint64(uint64(0));
    }

    function setPrice(bytes32 ciphertext) external {
        if (address(accessControl) != address(0)) {
            require(accessControl.hasRole(PRICE_FEEDER, msg.sender), "not feeder");
        }
        _price = TFHE.asEuint64(ciphertext);
        emit PriceUpdated(ciphertext);
    }

    // Return re-encrypted price to a viewer, using their public key hash.
    function peekPrice(address /*viewer*/, bytes32 /*pkHash*/) external view returns (bytes32) {
        // Placeholder: direct return until TFHE.reencrypt wiring is restored in helpers.
        // In production, re-encrypt for the viewer's public key using TFHE.reencrypt.
        return euint64.unwrap(_price);
    }

    function rawPrice() external view returns (bytes32) {
        return euint64.unwrap(_price);
    }
}


