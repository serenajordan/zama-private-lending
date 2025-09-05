import { ethers } from "ethers";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

/**
 * Get ethers provider for Sepolia testnet
 * @returns BrowserProvider instance
 */
export function getProvider(): ethers.BrowserProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not available");
  }
  
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Get ethers signer from MetaMask
 * @returns Signer instance
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = getProvider();
  return await provider.getSigner();
}

/**
 * Get user's address from MetaMask
 * @returns User's address
 */
export async function getUserAddress(): Promise<string> {
  const signer = await getSigner();
  return await signer.getAddress();
}

/**
 * Check if MetaMask is connected
 * @returns Boolean indicating connection status
 */
export function isMetaMaskConnected(): boolean {
  return typeof window !== "undefined" && 
         window.ethereum !== undefined && 
         window.ethereum.isMetaMask === true;
}

/**
 * Request MetaMask connection
 * @returns Promise that resolves when connected
 */
export async function requestMetaMaskConnection(): Promise<void> {
  if (typeof window !== "undefined" && window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }
}

/**
 * Switch to Sepolia network
 * @returns Promise that resolves when switched
 */
export async function switchToSepolia(): Promise<void> {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
      });
    } catch (error: any) {
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              nativeCurrency: {
                name: "Sepolia Ether",
                symbol: "SEP",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get network information
 * @returns Network object
 */
export async function getNetwork(): Promise<ethers.Network> {
  const provider = getProvider();
  return await provider.getNetwork();
}
