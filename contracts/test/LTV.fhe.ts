import { expect } from "chai";
import { ethers } from "hardhat";
import { maybeInitFHEVMOrSkip } from "./utils/fhe-env";

describe("Encrypted LTV borrow gating", function () {
  let fhe: any;

  before(async function () {
    fhe = await maybeInitFHEVMOrSkip(this);
    if (!fhe) return; // suite skipped on vanilla HH
  });

  it("allows borrow within LTV and reverts above it", async function () {
    if (!fhe) return this.skip();

    const [deployer, feeder, user] = await ethers.getSigners();

    const Price = await ethers.getContractFactory("PriceFeedEncrypted", deployer);
    const price = await Price.deploy(ethers.ZeroAddress);

    const Pool = await ethers.getContractFactory("PrivateLendingPool", deployer);
    const pool = await Pool.deploy(ethers.ZeroAddress, await price.getAddress());

    // Set price = 1.0 in RAY (1e9)
    const oneRay = 1_000_000_000n;
    await price.setPrice(ethers.hexlify(oneRay));

    // Deposit 100 (encrypted as bytes32)
    const dep = 100n;
    await pool.connect(user).deposit(ethers.hexlify(dep));

    // Borrow 60 (within 70% LTV) -> should pass
    await pool.connect(user).borrow(ethers.hexlify(60n));

    // Borrow 20 more (total 80 > 70% of 100) -> should revert by encrypted assert
    await expect(pool.connect(user).borrow(ethers.hexlify(20n))).to.be.revertedWith("Insufficient collateral");
  });
});


