# Zama Private Lending – Architecture

- **Contracts**
  - `ConfidentialUSD.sol`: ERC20-like with encrypted balances using TFHE (Zama FHEVM).
  - `PrivateLendingPool.sol`: encrypted deposits/debt, FHE comparisons for LTV & health factor.
- **Relayer**: @zama-fhe/relayer-sdk for key registration, input encryption, proofs.
- **App**: Next.js + wagmi; registers with relayer, encrypts inputs, renders decrypted position.

Sequence (Deposit):
1) Register with relayer → create encrypted buffer → add64(amount) → encrypt()
2) `depositFunds(handle, proof)` on pool
3) Pool updates encrypted state; app reads view & displays decrypted metrics.

Security notes: keys held client-side; on-chain state stays encrypted; only recipient can decrypt.
