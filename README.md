# Zama Private Lending Protocol

![CI](https://github.com/serenajordan/zama-private-lending/actions/workflows/ci.yml/badge.svg)

A confidential lending protocol built on Zama's fhEVM, enabling private DeFi operations with fully homomorphic encryption.

## Deployed Addresses (Sepolia)

- **ConfidentialUSD Token**: `0x0000000000000000000000000000000000000000` *(To be deployed)*
- **PrivateLendingPool**: `0x0000000000000000000000000000000000000000` *(To be deployed)*

## What's Private vs Public

| Data Type | Privacy Level | Implementation |
|-----------|---------------|----------------|
| Token balances | 🔒 **Private (FHE)** | Encrypted on-chain, only user can decrypt |
| Deposit/borrow amounts | 🔒 **Private (FHE)** | Encrypted during execution |
| Health flag | 🌐 **Public bool only** | Boolean liquidation status |
| Liquidation action | 🌐 **Public, amounts private** | Action visible, amounts encrypted |

## Quick Start

### 1. Faucet
Get demo cUSD tokens to start interacting with the protocol.

### 2. Deposit
Lock encrypted tokens as collateral for borrowing.

### 3. Borrow
Take out loans against your collateral (up to 70% LTV).

### 4. Repay
Pay back loans to unlock your collateral.

> **⚠️ Limitations / Demo Only**: This is a demonstration protocol. Do not use with real funds. The FHEVM infrastructure is still in development.

## Prerequisites

- Node.js 18+
- PNPM 8+
- MetaMask with Sepolia testnet configured

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd zama-private-lending

# Install dependencies
pnpm install

# Set up environment variables
cp contracts/.env.example contracts/.env
cp app/.env.local.example app/.env.local
# Edit .env files with your private key and RPC URL
```

## Development

```bash
# Start the Next.js app
pnpm dev

# Run contract tests
pnpm test

# Deploy to Sepolia
pnpm deploy:sepolia
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production app
- `pnpm test` - Run contract tests
- `pnpm deploy:sepolia` - Deploy contracts to Sepolia

## HCU Notes

| Component | HCU Usage | Notes |
|-----------|-----------|-------|
| FHE.add() | 1 HCU | Addition operations |
| FHE.sub() | 1 HCU | Subtraction operations |
| FHE.mul() | 2 HCU | Multiplication operations |
| FHE.div() | 3 HCU | Division operations |
| FHE.le() | 1 HCU | Less than or equal comparison |
| FHE.select() | 1 HCU | Conditional selection |
| FHE.fromExternal() | 5 HCU | External input decryption |
| FHE.isSenderAllowed() | 1 HCU | ACL validation |

**Total estimated HCU per transaction**: 15-25 HCU depending on operation complexity.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App  │    │  FHEVM Relayer   │    │  Smart Contracts│
│                 │    │                  │    │                 │
│ - Dashboard     │◄──►│ - Input Registry │◄──►│ - Confidential  │
│ - Actions       │    │ - User Decrypt   │    │   USD Token     │
│ - UI Components │    │ - Proof Gen      │    │ - Lending Pool  │
- LTV is enforced in encrypted domain using FHE.select (no data-dependent revert).
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Security Features

- **Encrypted state**: All sensitive data is encrypted on-chain
- **Zero-knowledge proofs**: Validates operations without revealing inputs
- **Access control**: FHEVM handles permission management
- **Error handling**: Structured error reporting with timestamps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

BSD-3-Clause-Clear

## Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm/)
- [FHEVM Solidity Library](https://docs.zama.ai/fhevm/solidity/)
- [Relayer SDK](https://docs.zama.ai/fhevm/relayer/)
- [Sepolia Testnet](https://sepolia.dev/)

### Faucet
Mint demo cUSD to interact with the pool.

