# Zama Private Lending Protocol
[![CI](https://img.shields.io/github/actions/workflow/status/${GITHUB_REPOSITORY:-serenajordan/zama-private-lending}/ci.yml?label=CI)](../../actions)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](./LICENSE)

Confidential lending on Zama's **fheVM**. Deposits, borrows, and repayments are done with **encrypted amounts**; balances/positions are unreadable on-chain.

## Live
- **App**: _TBD (Vercel)_  
- **Network**: Sepolia  
- **Contracts**: see "Deployed Addresses" below.

## Quick start
```bash
pnpm install
cp app/.env.local.example app/.env.local   # fill TOKEN/POOL, optional RELAYER_URL
pnpm -C app dev
```

## Architecture
See [docs/architecture.md](docs/architecture.md).

## What's FHE here?
- Encrypted ERC20 balances (TFHE).
- Encrypted deposits & debt.
- On-chain FHE comparisons for LTV / health factor.
- Client-side key registration + encrypted input proofs via relayer.

## Test & CI
```bash
pnpm -C contracts test
```
CI compiles, runs tests, and builds the app on Node 20.

## Demo script
1. Connect wallet (Sepolia) → **Register** (button in UI).
2. **Faucet** ≤ max.
3. **Deposit**; Dashboard shows encrypted on-chain state and decrypted client metrics.
4. **Borrow** (<= 70% LTV) → **Repay** part.

## Deployed Addresses (Sepolia)
- Token: `0x...`  
- Pool:  `0x...`

## Submission checklist
- ✅ README + Architecture
- ✅ CI
- ✅ FHE-specific code (not a wrapper)
- ✅ Commits this month
- ⏳ Tests with FHE paths
- ⏳ Hosted demo (Vercel)
- ⏳ Video walkthrough