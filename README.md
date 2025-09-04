# Zama Private Lending Protocol

A confidential lending protocol built on Zama's fhEVM, enabling private DeFi operations with fully homomorphic encryption.

## What's Private vs Public

In traditional DeFi, all transaction amounts, balances, and positions are publicly visible on-chain. This creates several problems:

- **MEV attacks**: Front-running and sandwich attacks based on visible transaction sizes
- **Privacy leaks**: Competitors can see your trading strategies and capital allocation
- **Targeted attacks**: Large positions become visible targets for exploitation

Our protocol uses Zama's fhEVM to encrypt all sensitive data:
- **Encrypted balances**: Your USD balance is encrypted and only you can decrypt it
- **Private transactions**: Transfer amounts are encrypted during execution
- **Confidential positions**: Your deposit and debt amounts remain private
- **Zero-knowledge proofs**: Validates transactions without revealing amounts

## Sepolia Testnet Addresses

### FHEVM Infrastructure
- **FHEVM Registry**: `0x000000000000000000000000000000000000005a`
- **FHEVM Verifier**: `0x000000000000000000000000000000000000005b`
- **FHEVM Gateway**: `0x000000000000000000000000000000000000005c`

### Protocol Contracts
- **ConfidentialUSD Token**: `[TO BE DEPLOYED]`
- **PrivateLendingPool**: `[TO BE DEPLOYED]`

## Quick Start

### Prerequisites
- Node.js 18+
- PNPM 8+
- MetaMask with Sepolia testnet configured

### Installation
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

### Development
```bash
# Start the Next.js app
pnpm dev

# Run contract tests
pnpm test

# Deploy to Sepolia
pnpm deploy:sepolia
```

## Run Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production app
- `pnpm test` - Run contract tests
- `pnpm deploy:sepolia` - Deploy contracts to Sepolia

## Deployed Addresses

*These will be populated after deployment*

- **ConfidentialUSD**: `[DEPLOYED_ADDRESS]`
- **PrivateLendingPool**: `[DEPLOYED_ADDRESS]`
- **Demo URL**: `[DEMO_URL]`

## How It Works

1. **Faucet**: Get encrypted test tokens
2. **Deposit**: Lock encrypted tokens as collateral
3. **Borrow**: Take out loans against your collateral (up to 70% LTV)
4. **Repay**: Pay back loans to unlock collateral

All operations use encrypted inputs and maintain privacy throughout the process.

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

