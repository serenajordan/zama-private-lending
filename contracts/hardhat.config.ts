import "@nomicfoundation/hardhat-toolbox";
// import "@fhevm/hardhat-plugin";
import "hardhat-gas-reporter";
import "dotenv/config";

export default {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "paris"
    }
  },
  gasReporter: { 
    enabled: true, 
    currency: "USD", 
    coinmarketcap: process.env.CMC_KEY || "", 
    showTimeSpent: true 
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  mocha: {
    timeout: 120000, // 120 seconds
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
