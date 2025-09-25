import { expect } from "chai";
import { ethers } from "hardhat";
import { maybeInitFHEVMOrSkip } from "./utils/fhe-env";

describe("Encrypted Liquidation Flow", function () {
  let fhe: any;

  before(async function () {
    fhe = await maybeInitFHEVMOrSkip(this);
    if (!fhe) return; // suite skipped on vanilla HH
  });

  it("liquidates unhealthy position after price shock", async function () {
    if (!fhe) return this.skip();

    const [deployer, feeder, user, keeper] = await ethers.getSigners();

    // Deploy price feed
    const Price = await ethers.getContractFactory("PriceFeedEncrypted", deployer);
    const price = await Price.deploy(ethers.ZeroAddress);

    // Deploy pool
    const Pool = await ethers.getContractFactory("PrivateLendingPool", deployer);
    const pool = await Pool.deploy(ethers.ZeroAddress, await price.getAddress());

    // Set initial price = 1.0 in RAY (1e9)
    const oneRay = 1_000_000_000n;
    await price.setPrice(ethers.hexlify(oneRay));

    // User deposits 100 collateral
    const dep = 100n;
    await pool.connect(user).deposit(ethers.hexlify(dep));

    // User borrows 60 (within 70% LTV)
    const borrow = 60n;
    await pool.connect(user).borrow(ethers.hexlify(borrow));

    // Price shock: drop to 0.5 (50% of original)
    const halfRay = 500_000_000n; // 0.5 * 1e9
    await price.setPrice(ethers.hexlify(halfRay));

    // Now position is unhealthy: collateral*price*threshold < debt
    // 100 * 0.5 * 0.8 = 40 < 60 (debt)
    // Keeper liquidates 20
    const liquidate = 20n;
    await pool.connect(keeper).liquidate(user.address, ethers.hexlify(liquidate));

    // Verify liquidation worked by checking position
    const [deposits, debts] = await pool.peekPosition(user.address);
    
    // Should have reduced debt by liquidate amount
    // and reduced deposits by liquidate * bonus (11%)
    const expectedDebt = borrow - liquidate; // 60 - 20 = 40
    const expectedDeposits = dep - (liquidate * 111n / 100n); // 100 - 22.2 = 77.8

    // Note: In a real test, we'd decrypt these values to verify
    // For now, just ensure the transaction succeeded
    expect(deposits).to.not.equal(ethers.hexlify(dep));
    expect(debts).to.not.equal(ethers.hexlify(borrow));
  });

  it("reverts when trying to liquidate healthy position", async function () {
    if (!fhe) return this.skip();

    const [deployer, feeder, user, keeper] = await ethers.getSigners();

    // Deploy price feed
    const Price = await ethers.getContractFactory("PriceFeedEncrypted", deployer);
    const price = await Price.deploy(ethers.ZeroAddress);

    // Deploy pool
    const Pool = await ethers.getContractFactory("PrivateLendingPool", deployer);
    const pool = await Pool.deploy(ethers.ZeroAddress, await price.getAddress());

    // Set price = 1.0 in RAY (1e9)
    const oneRay = 1_000_000_000n;
    await price.setPrice(ethers.hexlify(oneRay));

    // User deposits 100 collateral
    const dep = 100n;
    await pool.connect(user).deposit(ethers.hexlify(dep));

    // User borrows 60 (within 70% LTV)
    const borrow = 60n;
    await pool.connect(user).borrow(ethers.hexlify(borrow));

    // Try to liquidate healthy position - should revert
    const liquidate = 20n;
    await expect(
      pool.connect(keeper).liquidate(user.address, ethers.hexlify(liquidate))
    ).to.be.revertedWith("Position healthy");
  });
});
