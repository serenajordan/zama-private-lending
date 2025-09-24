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

## Environment Setup

Create `app/.env.local` with the following variables:

```bash
# Required: fhEVM Sepolia RPC
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.zama.ai

# Required: Chain ID (11155111 for Sepolia)
NEXT_PUBLIC_CHAIN_ID=11155111

# Required: Contract addresses
NEXT_PUBLIC_POOL=0x...  # PrivateLendingPool address
NEXT_PUBLIC_TOKEN=0x... # ConfidentialUSD address

# Optional: Demo mode (set to 0 for production)
NEXT_PUBLIC_DEMO=0

# Optional: Relayer URL for encrypted transactions
NEXT_PUBLIC_RELAYER_URL=https://relayer.sepolia.zama.ai

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
```

### Getting Started with fhEVM

1. **Install fhEVM Browser Extension**: Download from [Zama's website](https://zama.ai/fhevm)
2. **Switch to fhEVM Sepolia**: Use the network switcher in the app or manually add the network
3. **Get Test Tokens**: Use the faucet in the app to get ConfidentialUSD tokens
4. **Start Lending**: Deposit tokens and borrow against your collateral

### Network Configuration

The app automatically detects if you're on the wrong network and shows a banner with a "Switch Network" button. Make sure you're connected to fhEVM Sepolia (Chain ID: 11155111).

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