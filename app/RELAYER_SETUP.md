# Relayer Setup Instructions

## Environment Variables Required

Create or update `app/.env.local` with the following variables:

```bash
# Contract Addresses (already deployed)
NEXT_PUBLIC_TOKEN=0xbB22201aFCb3F9d085990f5A9e34055896641d4B
NEXT_PUBLIC_POOL=0x945E0aB1373518F945606ce00ed0d3C092a6a62B

# Sepolia Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# FHEVM Relayer Configuration
# TODO: Replace with actual Sepolia relayer URL (no trailing slash, not /keys)
NEXT_PUBLIC_RELAYER_URL=<FILL ME: correct base relayer URL for Sepolia, no trailing slash, not /keys>

# WalletConnect (can be dummy in dev)
NEXT_PUBLIC_WC_PROJECT_ID=YOUR_PROJECT_ID
```

## Verification Commands

After setting the relayer URL, verify it works with:

```bash
# Test health endpoint
curl -sS "$NEXT_PUBLIC_RELAYER_URL/health"

# Test keys endpoint
curl -sS "$NEXT_PUBLIC_RELAYER_URL/keys/tfhe"
```

## Expected Behavior

- The app will log `[relayer] healthy true/false` in the browser console on load
- The `encryptU64` function will log the effective relayer URL being used
- Faucet/deposit/borrow/repay actions will work once the relayer URL is correctly configured
