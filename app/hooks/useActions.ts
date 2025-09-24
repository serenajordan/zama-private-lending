'use client';
// Temporary stub while migrating to viem hooks in components
// If this hook is imported, throw a clear error so the build succeeds
export function useActions() {
  throw new Error('useActions is deprecated. Migrate to viem hooks: usePoolWrite/useTokenWrite + fhe.encryptAmount64.')
}