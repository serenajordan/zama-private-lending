const { ethers } = require("ethers");

// Contract addresses from deployment
const TOKEN_ADDRESS = "0x63Bae1af5cf8E1de84FE9A1f4eD873a48f625F88";
const POOL_ADDRESS = "0x36baA3E9B711C2ADc26Fa685aD9Eb397682D01d9";

// Simple ABI for testing
const POOL_ABI = [
  "function viewMyPosition() external view returns (uint256, uint256)",
  "function deposits(address) external view returns (uint256)",
  "function debts(address) external view returns (uint256)"
];

async function debugContract() {
  try {
    // Use a public RPC endpoint for Sepolia
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    
    console.log("🔍 Testing contract calls...");
    
    const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);
    
    // Test with a random address (or use the deployer address)
    const testAddress = "0x32988628B63a1eE9fD071B238E946d103DED9e4F"; // Deployer address
    
    console.log(`📋 Testing with address: ${testAddress}`);
    
    // Test individual mappings
    console.log("📊 Checking deposits mapping...");
    const deposits = await poolContract.deposits(testAddress);
    console.log(`   Deposits: ${deposits.toString()}`);
    
    console.log("📊 Checking debts mapping...");
    const debts = await poolContract.debts(testAddress);
    console.log(`   Debts: ${debts.toString()}`);
    
    // Test viewMyPosition
    console.log("📊 Testing viewMyPosition...");
    const [deposit, debt] = await poolContract.viewMyPosition();
    console.log(`   viewMyPosition result: deposit=${deposit.toString()}, debt=${debt.toString()}`);
    
    console.log("✅ Contract calls successful!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugContract();

