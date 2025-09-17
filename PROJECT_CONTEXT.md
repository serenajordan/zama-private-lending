# Project Context — Zama FHE Private Lending

## Goal
Lending pool on fhEVM where **all user-sensitive values remain encrypted**: balances, debt, health factor, etc.

## Hard Rules (must never break)
1) No plaintext ops on `euint*/ebool` — use `TFHE.add/sub/mul/div`, `TFHE.eq/lt/lte/gte/gt`, and `TFHE.cmux` for branching.
2) No on-chain decrypts in control flow. Replace any `require(TFHE.decrypt(...))` with `TFHE.req(<encrypted_condition>)`.
3) Only expose decrypted data in **tests** or gated developer tooling, never in runtime contracts.
4) Fixed-point convention: use `euint64`/`euint128` scaled by 1e9 (or your chosen scale). All math stays encrypted.
5) Interest, LTV, and liquidation checks remain in the encrypted domain.

## Tech
- Solidity + fhEVM TFHE lib
- Build: `pnpm hardhat compile`
- Test: `pnpm hardhat test`
- Lint: `pnpm lint` (if present)

## Key Files
- `contracts/PrivateLendingPool.sol` (+ any others using `euint*/ebool`)
- `test/`

## Invariants to enforce (encrypted)
- `newDebt <= maxBorrow`
- `healthFactor >= threshold` unless liquidatable
- Interest accrual monotonic without overflow at chosen scale
- Unauthorized actors cannot read private state
