import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Zama Private Lending Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  // Step 1: Deploy ConfidentialUSD token with temporary pool address
  console.log("🔐 Deploying ConfidentialUSD token (temporary)...");
  const ConfidentialUSDFactory = await ethers.getContractFactory("ConfidentialUSD");
  const tempToken = await ConfidentialUSDFactory.deploy(ethers.ZeroAddress); // Temporary placeholder
  await tempToken.waitForDeployment();
  
  const tempTokenAddress = await tempToken.getAddress();
  console.log(`✅ Temporary ConfidentialUSD deployed to: ${tempTokenAddress}`);

  // Step 2: Deploy PrivateLendingPool with the temporary token address
  console.log("🏦 Deploying PrivateLendingPool...");
  const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPool");
  const privateLendingPool = await PrivateLendingPoolFactory.deploy(tempTokenAddress);
  await privateLendingPool.waitForDeployment();
  
  const poolAddress = await privateLendingPool.getAddress();
  console.log(`✅ PrivateLendingPool deployed to: ${poolAddress}`);

  // Step 3: Deploy the final ConfidentialUSD token with the correct pool address
  console.log("🔄 Deploying final ConfidentialUSD token...");
  const finalToken = await ConfidentialUSDFactory.deploy(poolAddress);
  await finalToken.waitForDeployment();
  
  const finalTokenAddress = await finalToken.getAddress();
  console.log(`✅ Final ConfidentialUSD deployed to: ${finalTokenAddress}`);

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
