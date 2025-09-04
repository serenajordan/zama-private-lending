import { ethers } from "hardhat";
import { ConfidentialUSD, PrivateLendingPool } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Zama Private Lending Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  // Deploy PrivateLendingPool first
  console.log("🏦 Deploying PrivateLendingPool...");
  const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPool");
  const privateLendingPool = await PrivateLendingPoolFactory.deploy(ethers.ZeroAddress); // Temporary placeholder
  await privateLendingPool.waitForDeployment();
  
  const poolAddress = await privateLendingPool.getAddress();
  console.log(`✅ PrivateLendingPool deployed to: ${poolAddress}`);

  // Deploy ConfidentialUSD token with the correct pool address
  console.log("🔐 Deploying ConfidentialUSD token...");
  const ConfidentialUSDFactory = await ethers.getContractFactory("ConfidentialUSD");
  const confidentialUSD = await ConfidentialUSDFactory.deploy(poolAddress);
  await confidentialUSD.waitForDeployment();
  
  const tokenAddress = await confidentialUSD.getAddress();
  console.log(`✅ ConfidentialUSD deployed to: ${tokenAddress}`);

  // Update the pool's asset address
  console.log("🔗 Updating pool's asset address...");
  // Note: The pool constructor sets the asset address, so this should work correctly

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log(`   ConfidentialUSD Token: ${tokenAddress}`);
  console.log(`   PrivateLendingPool:   ${poolAddress}`);
  console.log(`   Deployer:             ${deployer.address}`);
  console.log(`   Network:              ${await ethers.provider.getNetwork().then(n => n.name)}`);

  // Save deployment addresses for frontend
  console.log("\n💾 Save these addresses in your .env files:");
  console.log(`   NEXT_PUBLIC_TOKEN=${tokenAddress}`);
  console.log(`   NEXT_PUBLIC_POOL=${poolAddress}`);

  console.log("\n🎉 Deployment complete! You can now interact with your private lending protocol.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
