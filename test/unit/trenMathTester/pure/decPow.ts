import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeHaveDecPow(): void {
  beforeEach(async function () {
    // Called by TrenBoxManager._calcDecayedBaseRate, so base = MINUTE_DECAY_FACTOR
    this.minuteDecayFactor = await this.contracts.trenBoxManager.MINUTE_DECAY_FACTOR();
  });

  context("when minutes is bigger than 1000 years", function () {
    it("exponent should be capped to 1000 years", async function () {
      const exponentCap = 525_600_000n;
      const oneMinute = time.duration.minutes(1);

      const base = this.minuteDecayFactor;
      const minutes = exponentCap + BigInt(oneMinute);
      const expectedResult = calculateDecPow(base, exponentCap);

      expect(await this.testContracts.trenMathTester.decPow(base, minutes)).to.equal(
        expectedResult
      );
    });
  });

  context("when minutes is less than 1000 years", function () {
    it("should return correct result", async function () {
      const tenMinutes = time.duration.minutes(10);

      const base = this.minuteDecayFactor;
      const minutes = BigInt(tenMinutes);
      const expectedResult = calculateDecPow(base, minutes);

      expect(await this.testContracts.trenMathTester.decPow(base, minutes)).to.equal(
        expectedResult
      );
    });
  });

  context("when minutes is zero", function () {
    it("should return decimal precision", async function () {
      const decimalPrecision = ethers.WeiPerEther;

      const base = this.minuteDecayFactor;
      const minutes = 0;

      expect(await this.testContracts.trenMathTester.decPow(base, minutes)).to.equal(
        decimalPrecision
      );
    });
  });
}

function calculateDecPow(base: bigint, minutes: bigint) {
  let y = ethers.WeiPerEther;
  let x = base;
  let n = minutes;

  // Exponentiation-by-squaring
  while (n > 1n) {
    if (n % 2n == 0n) {
      x = decMul(x, x);
      n = n / 2n;
    } else {
      // if (n % 2 != 0)
      y = decMul(x, y);
      x = decMul(x, x);
      n = (n - 1n) / 2n;
    }
  }

  return decMul(x, y);
}

function decMul(x: bigint, y: bigint) {
  const decimalPrecision = ethers.WeiPerEther;
  const decProd = (x * y + decimalPrecision / 2n) / decimalPrecision;
  return decProd;
}
