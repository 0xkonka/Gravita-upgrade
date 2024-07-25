import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetAddresses(): void {
  context("when called by owner", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;
    });

    it("should correctly set new addresses", async function () {
      const newBorrowerOperationsAddress = this.signers.accounts[1].address;
      const newStabilityPoolAddress = this.signers.accounts[2].address;
      const newTrenBoxManagerAddress = this.signers.accounts[3].address;

      await this.redeployedContracts.debtToken.setAddresses(
        newBorrowerOperationsAddress,
        newStabilityPoolAddress,
        newTrenBoxManagerAddress
      );

      expect(await this.redeployedContracts.debtToken.stabilityPoolAddress()).to.be.equal(
        newStabilityPoolAddress
      );
      expect(await this.redeployedContracts.debtToken.borrowerOperationsAddress()).to.be.equal(
        newBorrowerOperationsAddress
      );
      expect(await this.redeployedContracts.debtToken.trenBoxManagerAddress()).to.be.equal(
        newTrenBoxManagerAddress
      );
    });

    it("should emit event", async function () {
      const newBorrowerOperationsAddress = this.signers.accounts[1].address;
      const newStabilityPoolAddress = this.signers.accounts[2].address;
      const newTrenBoxManagerAddress = this.signers.accounts[3].address;

      await expect(
        this.redeployedContracts.debtToken.setAddresses(
          newBorrowerOperationsAddress,
          newStabilityPoolAddress,
          newTrenBoxManagerAddress
        )
      )
        .to.emit(this.redeployedContracts.debtToken, "ProtocolContractsAddressesSet")
        .withArgs(newBorrowerOperationsAddress, newStabilityPoolAddress, newTrenBoxManagerAddress);
    });

    context("when setting zero address", function () {
      it("should revert when borrowerOperationsAddress is zero", async function () {
        const newBorrowerOperationsAddress = ethers.ZeroAddress;
        const newStabilityPoolAddress = this.signers.accounts[1].address;
        const newTrenBoxManagerAddress = this.signers.accounts[3].address;

        await expect(
          this.contracts.debtToken.setAddresses(
            newBorrowerOperationsAddress,
            newStabilityPoolAddress,
            newTrenBoxManagerAddress
          )
        ).to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__InvalidAddressToConnect"
        );
      });

      it("should revert when stabilityPoolAddress is zero", async function () {
        const newBorrowerOperationsAddress = this.signers.accounts[1].address;
        const newStabilityPoolAddress = ethers.ZeroAddress;
        const newTrenBoxManagerAddress = this.signers.accounts[3].address;

        await expect(
          this.contracts.debtToken.setAddresses(
            newBorrowerOperationsAddress,
            newStabilityPoolAddress,
            newTrenBoxManagerAddress
          )
        ).to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__InvalidAddressToConnect"
        );
      });

      it("should revert when trenBoxManagerAddress is zero", async function () {
        const newBorrowerOperationsAddress = this.signers.accounts[1].address;
        const newStabilityPoolAddress = this.signers.accounts[2].address;
        const newTrenBoxManagerAddress = ethers.ZeroAddress;

        await expect(
          this.contracts.debtToken.setAddresses(
            newBorrowerOperationsAddress,
            newStabilityPoolAddress,
            newTrenBoxManagerAddress
          )
        ).to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__InvalidAddressToConnect"
        );
      });
    });
  });

  context("when called by non-owner", function () {
    it("should revert", async function () {
      const newBorrowerOperationsAddress = await this.contracts.borrowerOperations.getAddress();
      const newStabilityPoolAddress = await this.contracts.stabilityPool.getAddress();
      const newTrenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();

      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.debtToken
          .connect(notOwner)
          .setAddresses(
            newBorrowerOperationsAddress,
            newStabilityPoolAddress,
            newTrenBoxManagerAddress
          )
      )
        .to.be.revertedWithCustomError(this.contracts.debtToken, "OwnableUnauthorizedAccount")
        .withArgs(notOwner.address);
    });
  });
}
