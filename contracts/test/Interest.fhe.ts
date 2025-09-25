import { expect } from "chai";
import { ethers } from "hardhat";
import { maybeInitFHEVMOrSkip } from "./utils/fhe-env";

// Auto-skip on vanilla Hardhat; decrypt only inside tests
describe("Encrypted Interest Accrual", function () {
  let fhe: any;

  before(async function () {
    fhe = await maybeInitFHEVMOrSkip(this);
  });

  it("accrues per-block interest monotonically", async () => {
    const [deployer, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ConfidentialUSD");
    const token = await Token.deploy(ethers.ZeroAddress);
    await token.waitForDeployment();

    const Pool = await ethers.getContractFactory("PrivateLendingPool");
    const pool = await Pool.deploy(await token.getAddress());
    await pool.waitForDeployment();
    await token.connect(deployer).setPool(await pool.getAddress());

    // Set a tiny per-block rate: 1e7 (which is 0.01 in RAY=1e9 scale)
    await pool.setRatePerBlock(10_000_000);

    // Helper enc
    const enc = (n: bigint | number) => ethers.zeroPadValue(ethers.toBeHex(BigInt(n)), 32);

    // Deposit and borrow minimal principal
    await pool.connect(user).deposit(enc(1_000_000n));
    await pool.connect(user).borrow(enc(100_000n));

    const readDebt = async () => {
      const [, encDebt] = await pool.peekPosition(user.address);
      // Decrypt using fhevmjs instance (tests only)
      const d = await fhe.decrypt(encDebt);
      return BigInt(d);
    };

    const d0 = await readDebt();
    // Trigger accrue through a no-op repay of 0
    await pool.connect(user).repay(enc(0));
    const d1 = await readDebt();
    expect(d1).to.be.greaterThanOrEqual(d0);

    // Accrue again
    await pool.connect(user).repay(enc(0));
    const d2 = await readDebt();
    expect(d2).to.be.greaterThanOrEqual(d1);
  });

  it("exact tiny case: rate=0 produces unchanged debt", async () => {
    const [deployer, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ConfidentialUSD");
    const token = await Token.deploy(ethers.ZeroAddress);
    await token.waitForDeployment();

    const Pool = await ethers.getContractFactory("PrivateLendingPool");
    const pool = await Pool.deploy(await token.getAddress());
    await pool.waitForDeployment();
    await token.connect(deployer).setPool(await pool.getAddress());

    await pool.setRatePerBlock(0);

    const enc = (n: bigint | number) => ethers.zeroPadValue(ethers.toBeHex(BigInt(n)), 32);
    await pool.connect(user).deposit(enc(1_000_000n));
    await pool.connect(user).borrow(enc(123_456n));

    const readDebt = async () => {
      const [, encDebt] = await pool.peekPosition(user.address);
      const d = await fhe.decrypt(encDebt);
      return BigInt(d);
    };

    const before = await readDebt();
    await pool.connect(user).repay(enc(0));
    const after = await readDebt();
    expect(after).to.equal(before);
  });
});



