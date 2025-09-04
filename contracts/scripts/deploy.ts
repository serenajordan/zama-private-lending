import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Zama Private Lending Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  // Step 1: Deploy ConfidentialUSD token with a placeholder pool address
  console.log("🔐 Deploying ConfidentialUSD token...");
  const ConfidentialUSDFactory = await ethers.getContractFactory("ConfidentialUSD");
  const token = await ConfidentialUSDFactory.deploy(ethers.ZeroAddress); // We'll update this later
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log(`✅ ConfidentialUSD deployed to: ${tokenAddress}`);

  // Step 2: Deploy PrivateLendingPool with the token address
  console.log("🏦 Deploying PrivateLendingPool...");
  const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPool");
  const privateLendingPool = await PrivateLendingPoolFactory.deploy(tokenAddress);
  await privateLendingPool.waitForDeployment();
  
  const poolAddress = await privateLendingPool.getAddress();
  console.log(`✅ PrivateLendingPool deployed to: ${poolAddress}`);

  // Step 3: Deploy a new token with the correct pool address
  console.log("🔄 Deploying final token with correct pool address...");
  const finalToken = await ConfidentialUSDFactory.deploy(poolAddress);
  await finalToken.waitForDeployment();
  
  const finalTokenAddress = await finalToken.getAddress();
  console.log(`✅ Final ConfidentialUSD deployed to: ${finalTokenAddress}`);

  // Step 4: Update the pool's asset to point to the final token
  console.log("🔧 Updating pool's asset reference...");
  const updateTx = await privateLendingPool.updateAsset(finalTokenAddress);
  await updateTx.wait();
  console.log(`✅ Pool asset updated to: ${finalTokenAddress}`);

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
