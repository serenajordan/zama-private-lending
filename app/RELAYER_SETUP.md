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
# Required – base URL of the FHE relayer (no trailing slash)
# Example: https://relayer.sepolia.zama.ai
NEXT_PUBLIC_RELAYER_URL=https://<your-relayer-host>

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

## Expected Console Output

In the browser console on page load, you should see:

```
[relayer] healthy true url: https://your-relayer-url
```

If you see `false` or `(none)`, check your `NEXT_PUBLIC_RELAYER_URL` configuration.

## Error Handling

The app now includes proper relayer validation:

- **Missing URL**: Shows "Relayer URL not configured. Set NEXT_PUBLIC_RELAYER_URL in app/.env.local"
- **Unreachable URL**: Shows "Relayer unavailable at: [url]. Check DNS, URL and /health."
- **Actions are gated**: Faucet/Deposit/Borrow/Repay will not execute if relayer is unhealthy

## URL Normalization

The relayer URL is automatically normalized:
- Adds `https://` protocol if missing
- Removes trailing slashes
- Trims whitespace
- Validates format before use
