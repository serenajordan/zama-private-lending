import { ethers } from "ethers";

// Only import FHEVM SDK on client side to avoid SSR issues
let createInstance: any = null;
if (typeof window !== "undefined") {
  try {
    createInstance = require("@zama-fhe/relayer-sdk/web").createInstance;
  } catch (error) {
    console.warn("FHEVM SDK not available:", error);
  }
}

// Sepolia FHEVM Configuration
const SepoliaConfig = {
  verifyingContractAddressDecryption: "0x0000000000000000000000000000000000000000", // Placeholder - needs actual Sepolia address
  verifyingContractAddressInputVerification: "0x0000000000000000000000000000000000000000", // Placeholder - needs actual Sepolia address
  kmsContractAddress: "0x0000000000000000000000000000000000000000", // Placeholder - needs actual Sepolia address
  inputVerifierContractAddress: "0x0000000000000000000000000000000000000000", // Placeholder - needs actual Sepolia address
  aclContractAddress: "0x0000000000000000000000000000000000000000", // Placeholder - needs actual Sepolia address
  gatewayChainId: 11155111, // Sepolia chain ID
  chainId: 11155111,
  relayerUrl: "https://relayer.sepolia.fhevm.xyz", // Sepolia relayer URL
};

// Create singleton FHEVM instance
let fhevmInstance: any = null;

export const getRelayer = async () => {
  if (!fhevmInstance) {
    if (typeof window === "undefined" || !createInstance) {
      // Server-side or FHEVM not available - return mock instance
      fhevmInstance = {
        createEncryptedInput: () => ({ encryptedValue: "0x" }),
        publicDecrypt: async () => ({}),
        userDecrypt: async () => ({}),
        generateKeypair: async () => ({ privateKey: "0x1", publicKey: "0x2" }),
        add64: async (input: any) => input,
        encrypt: async (input: any) => input.encryptedValue || "0x",
      };
    } else {
      try {
        fhevmInstance = await createInstance(SepoliaConfig);
      } catch (error) {
        console.error("Failed to create FHEVM instance:", error);
        // Fallback to mock instance for development
        fhevmInstance = {
          createEncryptedInput: () => ({ encryptedValue: "0x" }),
          publicDecrypt: async () => ({}),
          userDecrypt: async () => ({}),
          generateKeypair: async () => ({ privateKey: "0x1", publicKey: "0x2" }),
          add64: async (input: any) => input,
          encrypt: async (input: any) => input.encryptedValue || "0x",
        };
      }
    }
  }
  return fhevmInstance;
};

// Helper function to encrypt uint64 values
export const encrypt64 = async (
  contract: string,
  user: string,
  value: bigint
): Promise<string> => {
  try {
    const instance = await getRelayer();
    
    // Create encrypted input using FHEVM
    const encryptedInput = await instance.createEncryptedInput(
      contract,
      user,
      value.toString()
    );
    
    // Add 64-bit encryption and get the encrypted value
    const encrypted = await instance.add64(encryptedInput);
    const encryptedValue = await instance.encrypt(encrypted);
    
    return encryptedValue;
  } catch (error) {
    console.error("Encryption failed:", error);
    // Fallback for development - return placeholder
    return `0x${value.toString(16).padStart(16, '0')}`;
  }
};

// Helper function to decrypt user position handles
export const userDecryptPosition = async (
  handles: string[],
  contractAddress: string,
  signer: ethers.Signer
): Promise<Record<string, bigint>> => {
  try {
    const instance = await getRelayer();
    const userAddress = await signer.getAddress();
    
    // Generate keypair for decryption
    const keypair = await instance.generateKeypair();
    const { privateKey, publicKey } = keypair;
    
    // Create EIP712 domain and types for signing
    const domain = {
      name: "FHEVM",
      version: "1",
      chainId: 11155111, // Sepolia
      verifyingContract: contractAddress,
    };
    
    const types = {
      DecryptionRequest: [
        { name: "handles", type: "string[]" },
        { name: "contractAddress", type: "address" },
        { name: "userAddress", type: "address" },
        { name: "timestamp", type: "uint256" },
        { name: "duration", type: "uint256" },
      ],
    };
    
    const timestamp = Math.floor(Date.now() / 1000);
    const duration = 86400; // 1 day
    
    const message = {
      handles,
      contractAddress,
      userAddress,
      timestamp,
      duration,
    };
    
    // Sign the EIP712 message
    const signature = await signer.signTypedData(domain, types, message);
    
    // Call userDecrypt with the signature
    const decryptedData = await instance.userDecrypt(
      handles.map(handle => ({ handle, contractAddress })),
      privateKey,
      publicKey,
      signature,
      [contractAddress],
      userAddress,
      timestamp,
      duration
    );
    
    // Convert decrypted data to bigint values
    const result: Record<string, bigint> = {};
    Object.entries(decryptedData).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        result[key] = BigInt(value);
      }
    });
    
    return result;
  } catch (error) {
    console.error("Position decryption failed:", error);
    // Fallback for development - return mock data
    return handles.reduce((acc, handle, index) => {
      acc[`position_${index}`] = BigInt(handle.slice(2, 18) || "0");
      return acc;
    }, {} as Record<string, bigint>);
  }
};
