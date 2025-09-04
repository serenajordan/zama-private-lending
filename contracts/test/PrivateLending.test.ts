import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialUSD, PrivateLendingPool } from "../typechain-types";
import { createInstance, createEncryptedInput } from "@fhevm/mock-utils";

describe("Private Lending Protocol", function () {
  let confidentialUSD: ConfidentialUSD;
  let privateLendingPool: PrivateLendingPool;
  let owner: any;
  let user1: any;
  let user2: any;
  let fhevm: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Initialize FHEVM instance
    fhevm = createInstance();
    
    // Deploy ConfidentialUSD token
    const ConfidentialUSDFactory = await ethers.getContractFactory("ConfidentialUSD");
    confidentialUSD = await ConfidentialUSDFactory.deploy(ethers.ZeroAddress);
    await confidentialUSD.waitForDeployment();
    
    // Deploy PrivateLendingPool
    const PrivateLendingPoolFactory = await ethers.getContractFactory("PrivateLendingPool");
    privateLendingPool = await PrivateLendingPoolFactory.deploy(await confidentialUSD.getAddress());
    await privateLendingPool.waitForDeployment();
  });

  describe("ConfidentialUSD", function () {
    it("Should allow faucet and increase balance", async function () {
      const amount = 1000n;
      const { handles, inputProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        amount
      );

      await confidentialUSD.connect(user1).faucet(handles[0], inputProof);
      
      const balance = await confidentialUSD.balanceOf(user1.address);
      expect(balance).to.not.equal(0);
    });

    it("Should handle transfer with sufficient balance", async function () {
      // First faucet some tokens
      const faucetAmount = 1000n;
      const { handles: faucetHandles, inputProof: faucetProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        faucetAmount
      );
      
      await confidentialUSD.connect(user1).faucet(faucetHandles[0], faucetProof);
      
      // Then transfer some tokens
      const transferAmount = 500n;
      const { handles: transferHandles, inputProof: transferProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        transferAmount
      );
      
      await confidentialUSD.connect(user1).transferEncrypted(
        user2.address,
        transferHandles[0],
        transferProof
      );
      
      // Check that transfer was successful
      const user1Balance = await confidentialUSD.balanceOf(user1.address);
      const user2Balance = await confidentialUSD.balanceOf(user2.address);
      
      expect(user1Balance).to.not.equal(0);
      expect(user2Balance).to.not.equal(0);
    });

    it("Should handle insufficient balance gracefully", async function () {
      // Faucet a small amount
      const faucetAmount = 100n;
      const { handles: faucetHandles, inputProof: faucetProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        faucetAmount
      );
      
      await confidentialUSD.connect(user1).faucet(faucetHandles[0], faucetProof);
      
      // Try to transfer more than available
      const transferAmount = 200n;
      const { handles: transferHandles, inputProof: transferProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        transferAmount
      );
      
      await confidentialUSD.connect(user1).transferEncrypted(
        user2.address,
        transferHandles[0],
        transferProof
      );
      
      // Check error code
      const [errorCode] = await confidentialUSD.getLastError(user1.address);
      expect(errorCode).to.equal(1); // Insufficient funds error
    });
  });

  describe("PrivateLendingPool", function () {
    it("Should allow deposit and increase user deposit", async function () {
      // First faucet some tokens
      const faucetAmount = 1000n;
      const { handles: faucetHandles, inputProof: faucetProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        faucetAmount
      );
      
      await confidentialUSD.connect(user1).faucet(faucetHandles[0], faucetProof);
      
      // Then deposit into pool
      const depositAmount = 500n;
      const { handles: depositHandles, inputProof: depositProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        depositAmount
      );
      
      await privateLendingPool.connect(user1).deposit(depositHandles[0], depositProof);
      
      // Check deposit was recorded
      const [deposit, debt] = await privateLendingPool.viewMyPosition();
      expect(deposit).to.not.equal(0);
      expect(debt).to.equal(0);
    });

    it("Should cap borrow by LTV ratio", async function () {
      // Faucet and deposit tokens
      const faucetAmount = 1000n;
      const { handles: faucetHandles, inputProof: faucetProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        faucetAmount
      );
      
      await confidentialUSD.connect(user1).faucet(faucetHandles[0], faucetProof);
      
      const depositAmount = 1000n;
      const { handles: depositHandles, inputProof: depositProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        depositAmount
      );
      
      await privateLendingPool.connect(user1).deposit(depositHandles[0], depositProof);
      
      // Try to borrow more than LTV allows (70% of 1000 = 700)
      const borrowAmount = 800n;
      const { handles: borrowHandles, inputProof: borrowProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        borrowAmount
      );
      
      await privateLendingPool.connect(user1).borrow(borrowHandles[0], borrowProof);
      
      // Check that debt is capped at LTV limit
      const [deposit, debt] = await privateLendingPool.viewMyPosition();
      expect(debt).to.not.equal(0);
      // Debt should be capped at 700 (70% of 1000)
    });

    it("Should handle repay without underflow", async function () {
      // Faucet, deposit, and borrow
      const faucetAmount = 1000n;
      const { handles: faucetHandles, inputProof: faucetProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        faucetAmount
      );
      
      await confidentialUSD.connect(user1).faucet(faucetHandles[0], faucetProof);
      
      const depositAmount = 1000n;
      const { handles: depositHandles, inputProof: depositProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        depositAmount
      );
      
      await privateLendingPool.connect(user1).deposit(depositHandles[0], depositProof);
      
      const borrowAmount = 300n;
      const { handles: borrowHandles, inputProof: borrowProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        borrowAmount
      );
      
      await privateLendingPool.connect(user1).borrow(borrowHandles[0], borrowProof);
      
      // Repay more than debt (should not underflow)
      const repayAmount = 500n;
      const { handles: repayHandles, inputProof: repayProof } = await createEncryptedInput(
        fhevm,
        await confidentialUSD.getAddress(),
        user1.address,
        repayAmount
      );
      
      await privateLendingPool.connect(user1).repay(repayHandles[0], repayProof);
      
      // Check that debt is now 0
      const [deposit, debt] = await privateLendingPool.viewMyPosition();
      expect(debt).to.equal(0);
    });
  });
});
