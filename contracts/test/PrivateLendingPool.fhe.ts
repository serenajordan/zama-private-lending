import { expect } from "chai";
import { ethers } from "hardhat";
import { maybeInitFHEVMOrSkip } from "./utils/fhe-env";

const BASIS_POINTS = 10_000n;
const MAX_LTV_BPS = 7_000n;
const LIQ_THRESHOLD_BPS = 8_000n;
const LIQ_BONUS_BPS = 11_000n;

const toEncrypted = (value: bigint | number) => {
  const big = BigInt(value);
  return ethers.zeroPadValue(ethers.toBeHex(big), 32);
};

const fromEncrypted = (value: any): bigint => ethers.toBigInt(value);

describe("PrivateLendingPool (encrypted invariants)", function () {
  let fhe: any;
  before(async function () {
    fhe = await maybeInitFHEVMOrSkip(this);
  });

  async function deployFixture() {
    const [deployer, borrower, liquidator] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ConfidentialUSD");
    const token = await Token.deploy(ethers.ZeroAddress);
    await token.waitForDeployment();

    const Pool = await ethers.getContractFactory("PrivateLendingPool");
    const pool = await Pool.deploy(await token.getAddress());
    await pool.waitForDeployment();

    await token.connect(deployer).setPool(await pool.getAddress());

    return { token, pool, deployer, borrower, liquidator };
  }

  const readPosition = async (pool: any, user: string) => {
    const [encDeposit, encDebt] = await pool.peekPosition(user);
    return {
      deposit: fromEncrypted(encDeposit),
      debt: fromEncrypted(encDebt),
    };
  };

  describe("borrow guard: newDebt <= maxBorrow", () => {
    const depositAmount = 1_000_000n; // 1.0 units with 6 decimals

    it("allows borrowing up to the encrypted MAX_LTV", async () => {
      const { pool, borrower } = await deployFixture();

      await pool.connect(borrower).deposit(toEncrypted(depositAmount));
      const maxBorrow = (depositAmount * MAX_LTV_BPS) / BASIS_POINTS;

      await expect(pool.connect(borrower).borrow(toEncrypted(maxBorrow))).to.not.be.reverted;

      const { deposit, debt } = await readPosition(pool, borrower.address);
      expect(deposit).to.equal(depositAmount);
      expect(debt).to.equal(maxBorrow);
    });

    it("reverts when requested debt breaches the LTV cap", async () => {
      const { pool, borrower } = await deployFixture();

      await pool.connect(borrower).deposit(toEncrypted(depositAmount));
      const excessive = (depositAmount * (MAX_LTV_BPS + 1n)) / BASIS_POINTS;

      await expect(pool.connect(borrower).borrow(toEncrypted(excessive))).to.be.revertedWith(
        "Insufficient collateral",
      );

      const { debt } = await readPosition(pool, borrower.address);
      expect(debt).to.equal(0n);
    });
  });

  describe("repay guard: never negative debt", () => {
    const depositAmount = 800_000n;
    const initialBorrow = (depositAmount * MAX_LTV_BPS) / BASIS_POINTS;

    it("reduces debt and zeroes out cleanly", async () => {
      const { pool, borrower } = await deployFixture();

      await pool.connect(borrower).deposit(toEncrypted(depositAmount));
      await pool.connect(borrower).borrow(toEncrypted(initialBorrow));

      const firstRepay = initialBorrow / 2n;
      await expect(pool.connect(borrower).repay(toEncrypted(firstRepay))).to.not.be.reverted;

      let position = await readPosition(pool, borrower.address);
      expect(position.debt).to.equal(initialBorrow - firstRepay);

      const secondRepay = initialBorrow - firstRepay;
      await expect(pool.connect(borrower).repay(toEncrypted(secondRepay))).to.not.be.reverted;

      position = await readPosition(pool, borrower.address);
      expect(position.debt).to.equal(0n);

      await expect(pool.connect(borrower).repay(toEncrypted(1n))).to.be.revertedWith(
        "Repaying more than owed",
      );
    });
  });

  describe("interest accrual monotonicity", () => {
    const depositAmount = 1_200_000n;
    const initialBorrow = (depositAmount * MAX_LTV_BPS) / BASIS_POINTS;
    const rates = [250n, 300n, 150n];

    it("increases debt step after step", async () => {
      const { pool, borrower } = await deployFixture();

      await pool.connect(borrower).deposit(toEncrypted(depositAmount));
      await pool.connect(borrower).borrow(toEncrypted(initialBorrow));

      let previousDebt = (await readPosition(pool, borrower.address)).debt;
      expect(previousDebt).to.equal(initialBorrow);

      for (const rate of rates) {
        await expect(pool.accrueInterest(borrower.address, toEncrypted(rate))).to.not.be.reverted;
        const { debt } = await readPosition(pool, borrower.address);
        const expected = previousDebt + (previousDebt * rate) / BASIS_POINTS;
        expect(debt).to.equal(expected);
        expect(debt).to.be.greaterThan(previousDebt);
        previousDebt = debt;
      }
    });
  });

  describe("liquidation when health factor falls below threshold", () => {
    const depositAmount = 1_000_000n;
    const maxBorrow = (depositAmount * MAX_LTV_BPS) / BASIS_POINTS;
    const interestRate = 1_500n; // 15%
    const repaySlice = 200_000n;

    it("blocks liquidation while healthy and succeeds after interest pushes HF below threshold", async () => {
      const { pool, borrower, liquidator } = await deployFixture();

      await pool.connect(borrower).deposit(toEncrypted(depositAmount));
      await pool.connect(borrower).borrow(toEncrypted(maxBorrow));

      await expect(
        pool.connect(liquidator).liquidate(borrower.address, toEncrypted(repaySlice)),
      ).to.be.revertedWith("Position healthy");

      await pool.accrueInterest(borrower.address, toEncrypted(interestRate));

      const before = await readPosition(pool, borrower.address);
      expect(Number(before.deposit * LIQ_THRESHOLD_BPS)).to.be.lessThan(
        Number(before.debt * BASIS_POINTS),
      );
      const expectedCollateralSeized = (repaySlice * LIQ_BONUS_BPS) / BASIS_POINTS;

      await expect(
        pool.connect(liquidator).liquidate(borrower.address, toEncrypted(repaySlice)),
      ).to.not.be.reverted;

      const afterBorrower = await readPosition(pool, borrower.address);
      const afterLiquidator = await readPosition(pool, liquidator.address);

      expect(afterBorrower.debt).to.equal(before.debt - repaySlice);
      expect(afterBorrower.deposit).to.equal(before.deposit - expectedCollateralSeized);
      expect(afterLiquidator.deposit).to.equal(expectedCollateralSeized);
    });
  });
});
