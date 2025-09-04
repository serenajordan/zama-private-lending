import { ethers } from "hardhat";
import { ConfidentialUSD, PrivateLendingPool } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Zama Private Lending Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  // Deploy ConfidentialUSD token first
  console.log("🔐 Deploying ConfidentialUSD token...");
  const ConfidentialUSDFactory = await ethers.getContractFactory("ConfidentialUSD");
  const confidentialUSD = await ConfidentialUSDFactory.deploy(ethers.ZeroAddress); // Temporary placeholder for pool
  await confidentialUSD.waitForDeployment();
  
  const tokenAddress = await confidentialUSD.getAddress();
  console.log(`✅ ConfidentialUSD deployed to: ${tokenAddress}`);

  // Deploy PrivateLendingPool with the correct token address
  console.log("🏦 Deploying PrivateLendingPool...");
  const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPool");
  const privateLendingPool = await PrivateLendingPoolFactory.deploy(tokenAddress);
  await privateLendingPool.waitForDeployment();
  
  const poolAddress = await privateLendingPool.getAddress();
  console.log(`✅ PrivateLendingPool deployed to: ${poolAddress}`);

  // Update the token's pool address
  console.log("🔗 Updating token's pool address...");
  // Note: We need to redeploy the token with the correct pool address
  // For now, we'll use a different approach - deploy token again with correct pool address
  
  console.log("🔄 Redeploying token with correct pool address...");
  const ConfidentialUSDFactory2 = await ethers.getContractFactory("ConfidentialUSD");
  const confidentialUSD2 = await ConfidentialUSDFactory2.deploy(poolAddress);
  await confidentialUSD2.waitForDeployment();
  
  const finalTokenAddress = await confidentialUSD2.getAddress();
  console.log(`✅ ConfidentialUSD redeployed to: ${finalTokenAddress}`);

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log(`   ConfidentialUSD Token: ${finalTokenAddress}`);
  console.log(`   PrivateLendingPool:   ${poolAddress}`);
  console.log(`   Deployer:             ${deployer.address}`);
  console.log(`   Network:              ${await ethers.provider.getNetwork().then(n => n.name)}`);

  // Save deployment addresses for frontend
  console.log("\n💾 Save these addresses in your .env files:");
  console.log(`   NEXT_PUBLIC_TOKEN=${finalTokenAddress}`);
  console.log(`   NEXT_PUBLIC_POOL=${poolAddress}`);

  console.log("\n🎉 Deployment complete! You can now interact with your private lending protocol.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
