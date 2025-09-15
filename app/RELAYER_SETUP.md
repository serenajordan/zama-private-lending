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
# Example: https://relayer.testnet.zama.cloud
NEXT_PUBLIC_RELAYER_URL=https://relayer.testnet.zama.cloud

# WalletConnect (can be dummy in dev)
NEXT_PUBLIC_WC_PROJECT_ID=YOUR_PROJECT_ID
```

## Verification Commands

After setting the relayer URL, verify it works with:

```bash
# Set your relayer URL
RELAYER="https://relayer.testnet.zama.cloud"

# Test health endpoint
curl -sS "$RELAYER/health"

# Test keys endpoint  
curl -sS "$RELAYER/keys/tfhe"
```

## Expected Console Output

In the browser console on page load, you should see:

```
[relayer] healthy true url: https://relayer.testnet.zama.cloud
```

If you see `false` or `(none)`, check your `NEXT_PUBLIC_RELAYER_URL` configuration.

## Error Handling

The app now includes proper relayer validation:

- **Missing URL**: Shows warning in dev console: `[relayer] no NEXT_PUBLIC_RELAYER_URL configured`
- **Unreachable URL**: Shows "Relayer offline" on action buttons and system banner
- **Actions are gated**: Faucet/Deposit/Borrow/Repay buttons are disabled when relayer is unhealthy
- **Health checks**: Automatic retry with exponential backoff (250ms, 500ms, 1s)

## URL Normalization

The relayer URL is automatically normalized:
- Adds `https://` protocol if missing
- Removes trailing slashes
- Trims whitespace
- Validates format before use

## Development Notes

- **Restart required**: After changing environment variables, restart the dev server with `pnpm -C app dev`
- **Health monitoring**: The system banner shows relayer status and updates every 30 seconds
- **Button states**: Action buttons show "Relayer offline" when the relayer is unavailable
- **Keys verification**: The `/keys/tfhe` endpoint is checked before encryption operations
