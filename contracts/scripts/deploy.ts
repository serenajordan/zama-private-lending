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

  // Step 2: Deploy MockPriceFeed (for testing on regular EVM)
  console.log("📊 Deploying MockPriceFeed...");
  const PriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
  const priceFeed = await PriceFeedFactory.deploy();
  await priceFeed.waitForDeployment();
  
  const priceFeedAddress = await priceFeed.getAddress();
  console.log(`✅ MockPriceFeed deployed to: ${priceFeedAddress}`);

  // Step 3: Deploy PrivateLendingPoolMock (for testing on regular EVM)
  console.log("🏦 Deploying PrivateLendingPoolMock...");
  const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPoolMock");
  const privateLendingPool = await PrivateLendingPoolFactory.deploy(tokenAddress, priceFeedAddress);
  await privateLendingPool.waitForDeployment();
  
  const poolAddress = await privateLendingPool.getAddress();
  console.log(`✅ PrivateLendingPoolMock deployed to: ${poolAddress}`);

  // Step 4: Set the pool address on the token (so onlyPool checks succeed)
  console.log("🔧 Setting pool address on token...");
  const setPoolTx = await token.setPool(poolAddress);
  await setPoolTx.wait();
  console.log(`✅ Token pool address set to: ${poolAddress}`);

  // Step 5: Verify all addresses actually have code on Sepolia
  console.log("🔍 Verifying contract code on network...");
  const provider = ethers.provider;
  const tokenCode = await provider.getCode(tokenAddress);
  const poolCode = await provider.getCode(poolAddress);
  const priceFeedCode = await provider.getCode(priceFeedAddress);
  if (tokenCode === "0x") { throw new Error(`No code at token address ${tokenAddress}`); }
  if (poolCode === "0x") { throw new Error(`No code at pool address ${poolAddress}`); }
  if (priceFeedCode === "0x") { throw new Error(`No code at priceFeed address ${priceFeedAddress}`); }
  console.log(`✅ Token code length: ${tokenCode.length}`);
  console.log(`✅ Pool code length: ${poolCode.length}`);
  console.log(`✅ PriceFeed code length: ${priceFeedCode.length}`);

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log(`   ConfidentialUSD Token: ${tokenAddress}`);
  console.log(`   PrivateLendingPoolMock: ${poolAddress}`);
  console.log(`   MockPriceFeed:       ${priceFeedAddress}`);
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
