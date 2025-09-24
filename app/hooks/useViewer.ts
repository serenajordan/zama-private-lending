import { create } from "zustand"

type ViewerState = {
  publicKey?: string
  publicKeyHash?: `0x${string}`
  secretKey?: string
  setKeys: (keys: Partial<Pick<ViewerState, "publicKey" | "publicKeyHash" | "secretKey">>) => void
  clear: () => void
}

export const useViewer = create<ViewerState>((set) => ({
  publicKey: undefined,
  publicKeyHash: undefined,
  secretKey: undefined,
  setKeys: (keys) => set((s) => ({ ...s, ...keys })),
  clear: () => set({ publicKey: undefined, publicKeyHash: undefined, secretKey: undefined }),
}))


