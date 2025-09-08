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
    // Double-check with a public Sepolia provider (guards against wallet RPC anomalies)
    const pub = ethers.getDefaultProvider("sepolia");
    const code2 = await pub.getCode(POOL_ADDR);
    if (code2 === "0x") {
      throw new Error("Pool address has no contract code on Sepolia (checked wallet RPC and public RPC). Check NEXT_PUBLIC_POOL and network.");
    } else {
      console.warn("[warn] Wallet RPC returned no code but public RPC sees contract code. Continuing with wallet provider.");
    }
  }
  // @ts-ignore
  return new ethers.Contract(POOL_ADDR, (PoolArtifact as any).abi, signer);
}

export async function getToken(s?: ethers.Signer) {
  const signer = s ?? await getSigner();
  const provider = signer.provider as ethers.BrowserProvider;
  const code = await provider.getCode(TOKEN_ADDR);
  if (code === "0x") {
    const pub = ethers.getDefaultProvider("sepolia");
    const code2 = await pub.getCode(TOKEN_ADDR);
    if (code2 === "0x") {
      throw new Error("Token address has no contract code on Sepolia (checked wallet RPC and public RPC). Check NEXT_PUBLIC_TOKEN and network.");
    } else {
      console.warn("[warn] Wallet RPC returned no code but public RPC sees token code. Continuing.");
    }
  }
  // @ts-ignore
  return new ethers.Contract(TOKEN_ADDR, (TokenArtifact as any).abi, signer);
}

// Handy browser debug hook (attachable from layout)
export async function debugCodes() {
  // @ts-ignore
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  // @ts-ignore
  const provider = new ethers.BrowserProvider(window.ethereum);
  const codePoolBrowser = await provider.getCode(POOL_ADDR);
  const codeTokenBrowser = await provider.getCode(TOKEN_ADDR);
  const pub = ethers.getDefaultProvider("sepolia");
  const codePoolPublic = await pub.getCode(POOL_ADDR);
  const codeTokenPublic = await pub.getCode(TOKEN_ADDR);
  return {
    chainId,
    POOL_ADDR,
    TOKEN_ADDR,
    browser: { poolLen: codePoolBrowser.length, tokenLen: codeTokenBrowser.length },
    publicRPC: { poolLen: codePoolPublic.length, tokenLen: codeTokenPublic.length }
  };
}
