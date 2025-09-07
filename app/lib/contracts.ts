import { ethers } from "ethers";
import PoolArtifact from "@/abis/PrivateLendingPool.json";
import TokenArtifact from "@/abis/ConfidentialUSD.json";

export const POOL_ADDR  = process.env.NEXT_PUBLIC_POOL!;
export const TOKEN_ADDR = process.env.NEXT_PUBLIC_TOKEN!;

export async function getSigner() {
  // @ts-ignore
  await window.ethereum.request({ method: "eth_requestAccounts" });
  // @ts-ignore
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export async function getPool(s?: ethers.Signer) {
  const signer = s ?? await getSigner();
  const provider = signer.provider as ethers.BrowserProvider;
  const code = await provider.getCode(POOL_ADDR);
  if (code === "0x") {
    throw new Error("Pool address has no contract code on this network. Check NEXT_PUBLIC_POOL and your wallet network (Sepolia).");
  }
  // @ts-ignore
  return new ethers.Contract(POOL_ADDR, (PoolArtifact as any).abi, signer);
}

export async function getToken(s?: ethers.Signer) {
  const signer = s ?? await getSigner();
  const provider = signer.provider as ethers.BrowserProvider;
  const code = await provider.getCode(TOKEN_ADDR);
  if (code === "0x") {
    throw new Error("Token address has no contract code on this network. Check NEXT_PUBLIC_TOKEN and your wallet network (Sepolia).");
  }
  // @ts-ignore
  return new ethers.Contract(TOKEN_ADDR, (TokenArtifact as any).abi, signer);
}
