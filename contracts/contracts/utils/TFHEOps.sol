// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

import { FHE } from "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";

library TFHE {
    function add(euint64 a, euint64 b) internal returns (euint64) {
        return FHE.add(a, b);
    }

    function add(euint64 a, uint64 b) internal returns (euint64) {
        return FHE.add(a, b);
    }

    function sub(euint64 a, euint64 b) internal returns (euint64) {
        return FHE.sub(a, b);
    }

    function sub(euint64 a, uint64 b) internal returns (euint64) {
        return FHE.sub(a, b);
    }

    function mul(euint64 a, euint64 b) internal returns (euint64) {
        return FHE.mul(a, b);
    }

    function mul(euint64 a, uint64 b) internal returns (euint64) {
        return FHE.mul(a, b);
    }

    function div(euint64 a, uint64 b) internal returns (euint64) {
        return FHE.div(a, b);
    }


    function eq(euint64 a, euint64 b) internal returns (ebool) {
        return FHE.eq(a, b);
    }

    function lt(euint64 a, euint64 b) internal returns (ebool) {
        return FHE.lt(a, b);
    }

    function lte(euint64 a, euint64 b) internal returns (ebool) {
        return FHE.le(a, b);
    }

    function gt(euint64 a, euint64 b) internal returns (ebool) {
        return FHE.gt(a, b);
    }

    function gte(euint64 a, euint64 b) internal returns (ebool) {
        return FHE.ge(a, b);
    }

    function asEuint64(uint256 value) internal returns (euint64) {
        return FHE.asEuint64(uint64(value));
    }

    function asEuint64(uint64 value) internal returns (euint64) {
        return FHE.asEuint64(value);
    }

    function asEuint64(bytes32 value) internal pure returns (euint64) {
        return euint64.wrap(value);
    }

    function asEuint64(euint64 value) internal pure returns (euint64) {
        return value;
    }

    function asEuint64(ebool value) internal returns (euint64) {
        return FHE.asEuint64(value);
    }

    function fromExternal(externalEuint64 inputHandle, bytes memory proof) internal returns (euint64) {
        return FHE.fromExternal(inputHandle, proof);
    }

    function decrypt(ebool value) internal pure returns (bool) {
        return ebool.unwrap(value) != bytes32(0);
    }

    function decrypt(euint64 value) internal pure returns (uint64) {
        return uint64(uint256(euint64.unwrap(value)));
    }

    function req(ebool condition, string memory message) internal pure {
        if (!decrypt(condition)) {
            revert(message);
        }
    }

    function cmux(ebool condition, euint64 ifTrue, euint64 ifFalse) internal pure returns (euint64) {
        return decrypt(condition) ? ifTrue : ifFalse;
    }
}
