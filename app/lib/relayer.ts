import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";
import { ethers } from "ethers";

// Create singleton FHEVM instance
const fhevm = createInstance(SepoliaConfig);

/**
 * Encrypt a value for a specific contract and user
 * @param contract Contract address
 * @param user User address
 * @param value Value to encrypt
 * @returns Object with handles and input proof
 */
export async function encrypt64(
  contract: string,
  user: string,
  value: bigint
): Promise<{ handles: any[]; inputProof: string }> {
  try {
    const { handles, inputProof } = await fhevm.createEncryptedInput(
      contract,
      user,
      value
    );
    
    return { handles, inputProof };
  } catch (error) {
    console.error("Error encrypting value:", error);
    throw new Error("Failed to encrypt value");
  }
}

/**
 * Decrypt multiple handles for a user
 * @param handles Array of encrypted handles
 * @param contract Contract address
 * @returns Array of decrypted values
 */
export async function userDecrypt(
  handles: any[],
  contract: string
): Promise<bigint[]> {
  try {
    // Generate keypair for the user
    const keypair = await fhevm.generateKeypair();
    
    // Create EIP-712 signature
    const domain = {
      name: "FHEVM",
      version: "1.0.0",
      chainId: 11155111, // Sepolia
      verifyingContract: contract,
    };
    
    const types = {
      Reencrypt: [
        { name: "publicKey", type: "bytes" },
        { name: "signature", type: "bytes" },
      ],
    };
    
    const message = {
      publicKey: keypair.publicKey,
      signature: keypair.signature,
    };
    
    // Get signer from window.ethereum
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const signature = await signer.signTypedData(domain, types, message);
      
      // Decrypt all handles
      const decryptedValues = await Promise.all(
        handles.map(async (handle) => {
          return await fhevm.userDecrypt(handle, contract, keypair.publicKey, signature);
        })
      );
      
      return decryptedValues;
    } else {
      throw new Error("MetaMask not available");
    }
  } catch (error) {
    console.error("Error decrypting handles:", error);
    throw new Error("Failed to decrypt handles");
  }
}

/**
 * Get the FHEVM instance
 * @returns FHEVM instance
 */
export function getFhevmInstance() {
  return fhevm;
}

/**
 * Check if FHEVM is available
 * @returns Boolean indicating if FHEVM is ready
 */
export function isFhevmReady(): boolean {
  return fhevm !== null && fhevm !== undefined;
}
