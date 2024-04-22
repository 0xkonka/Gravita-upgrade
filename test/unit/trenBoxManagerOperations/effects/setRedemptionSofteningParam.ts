import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeSetRedemptionSofteningParam(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;
    this.timeLockImpostor = this.signers.accounts[3];

    const TrenBoxManagerOperationsFactory = await ethers.getContractFactory(
      "TrenBoxManagerOperations"
    );
    const trenBoxManagerOperations = await TrenBoxManagerOperationsFactory.connect(owner).deploy();
    await trenBoxManagerOperations.waitForDeployment();
    await trenBoxManagerOperations.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManagerOperations = trenBoxManagerOperations;

    await this.utils.connectRedeployedContracts({
      trenBoxManagerOperations: this.redeployedContracts.trenBoxManagerOperations,
      timelock: this.timeLockImpostor,
    });
  });

  context("when caller is not timelock address", function () {
    it("should revert with custom error TrenBoxManagerOperations__NotTimelock", async function () {
      await expect(
        this.contracts.trenBoxManagerOperations.setRedemptionSofteningParam(0)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NotTimelock"
      );
    });
  });

  context("when execute with not correct redemptionSofteningParam", function () {
    it("should revert with custom error if value less than needed", async function () {
      await expect(
        this.redeployedContracts.trenBoxManagerOperations
          .connect(this.timeLockImpostor)
          .setRedemptionSofteningParam(2n)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__InvalidParam"
      );
    });

    it("should revert with custom error if value bigger than needed", async function () {
      await expect(
        this.redeployedContracts.trenBoxManagerOperations
          .connect(this.timeLockImpostor)
          .setRedemptionSofteningParam(10001n)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__InvalidParam"
      );
    });
  });

  context(
    "when execute with correct redemptionSofteningParam and emit RedemptionSoftenParamChanged",
    function () {
      it("should revert with custom error TrenBoxManagerOperations__FeePercentOutOfBounds", async function () {
        const redemptionSofteningParam = 10000n;

        await expect(
          this.redeployedContracts.trenBoxManagerOperations
            .connect(this.timeLockImpostor)
            .setRedemptionSofteningParam(redemptionSofteningParam)
        )
          .to.emit(
            this.redeployedContracts.trenBoxManagerOperations,
            "RedemptionSoftenParamChanged"
          )
          .withArgs(redemptionSofteningParam);
      });
    }
  );
}
