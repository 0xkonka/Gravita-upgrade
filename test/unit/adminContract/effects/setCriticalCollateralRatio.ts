import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "ethers";

const MIN_CCR = ethers.parseEther("1");
const MAX_CCR = ethers.parseEther("10");

export default function shouldBehaveLikeCanSetCriticalCollateralRatio(): void {
  context("when modifying CCR on active collateral", function () {
    it("set CCR should match value after CCR_GRACE_PERIOD passes", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const ccr = 1750000000000000000n;
      const GRACE_PERIOD = await this.contracts.adminContract.CCR_GRACE_PERIOD();

      await this.contracts.adminContract.setCCR(collateralAddress, ccr);
      await time.increase(GRACE_PERIOD);

      expect(await this.contracts.adminContract.getCcr(collateralAddress)).to.be.equal(ccr);
    });

    it("set CCR should increase only by 50% value half after CCR_GRACE_PERIOD passes", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const ccr = 1750000000000000000n;
      const expectedCCR = 1625000000000000000n;
      const GRACE_PERIOD = await this.contracts.adminContract.CCR_GRACE_PERIOD();

      await this.contracts.adminContract.setCCR(collateralAddress, ccr);

      await time.increase(GRACE_PERIOD / 2n);

      expect(await this.contracts.adminContract.getCcr(collateralAddress)).to.be.equal(expectedCCR);
    });

    it("should emit CCRChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const oldCCR = await this.contracts.adminContract.getCcr(collateralAddress);

      const newCCR = 1500000000000000000n;

      await expect(this.contracts.adminContract.setCCR(collateralAddress, newCCR))
        .to.emit(this.contracts.adminContract, "CCRChanged")
        .withArgs(oldCCR, newCCR);
    });

    it("setting CCR too high should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newCCR = ethers.parseEther("1001");

      await expect(this.contracts.adminContract.setCCR(collateralAddress, newCCR))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("CCR", newCCR, MIN_CCR, MAX_CCR);
    });

    it("setting CCR too low should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newCCR = ethers.parseEther("0.999");

      await expect(this.contracts.adminContract.setCCR(collateralAddress, newCCR))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("CCR", newCCR, MIN_CCR, MAX_CCR);
    });

    it("only owner can set CCR", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newCCR = "1500000000000000000";

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract.connect(anotherAccount).setCCR(collateralAddress, newCCR)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying CCR on inactive collateral", function () {
    it("set CCR should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const ccr = "1500000000000000000";

      await expect(
        this.contracts.adminContract.setCCR(collateralAddress, ccr)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralNotConfigured"
      );
    });
  });
}
