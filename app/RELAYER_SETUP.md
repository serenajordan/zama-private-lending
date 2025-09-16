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

# Gateway Chain ID for Sepolia
NEXT_PUBLIC_GATEWAY_CHAIN_ID=55815

# WalletConnect (can be dummy in dev)
NEXT_PUBLIC_WC_PROJECT_ID=YOUR_PROJECT_ID
```

## SDK-Based Health Checks

The app now uses the official `@zama-fhe/relayer-sdk` for all relayer operations:

- **No more `/health` endpoint calls**: The SDK handles health checks internally
- **Automatic key fetching**: The SDK manages TFHE key retrieval and caching
- **Proper error handling**: SDK provides better error messages and retry logic

## Expected Console Output

In the browser console on page load, you should see:

```
[relayer] checking health...
[relayer] health check result: ✅ healthy
```

If you see `❌ unhealthy`, check your `NEXT_PUBLIC_RELAYER_URL` configuration.

## Error Handling

The app now includes proper relayer validation using the SDK:

- **SDK initialization**: Uses `createInstance()` with SepoliaConfig
- **Health checks**: Calls `getTfheCompactPublicKey()` to verify relayer connectivity
- **Actions are gated**: Faucet/Deposit/Borrow/Repay buttons are disabled when relayer is unhealthy
- **Better error messages**: SDK provides more descriptive error information

## URL Normalization

The relayer URL is automatically normalized:
- Removes trailing slashes
- Trims whitespace
- Uses SepoliaConfig as fallback if no URL provided

## Development Notes

- **Restart required**: After changing environment variables, restart the dev server with `pnpm -C app dev`
- **Health monitoring**: The system banner shows relayer status and updates every 30 seconds
- **Button states**: Action buttons show "Relayer offline" when the relayer is unavailable
- **SDK-based encryption**: All encryption operations now use the official SDK methods
