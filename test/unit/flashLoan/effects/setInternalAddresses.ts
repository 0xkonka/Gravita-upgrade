import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetInternalAddresses(): void {
  context("when called by owner", function () {
    it("should correctly set addresses", async function () {
      const stableCoinAddress = this.signers.accounts[1].address;
      const swapRouterAddress = this.signers.accounts[2].address;

      const tx = await this.contracts.flashLoan.setInternalAddresses(
        stableCoinAddress,
        swapRouterAddress
      );

      expect(await this.contracts.flashLoan.stableCoin()).to.be.equal(stableCoinAddress);
      expect(await this.contracts.flashLoan.swapRouter()).to.be.equal(swapRouterAddress);
      expect(await this.contracts.flashLoan.isSetupInitialized()).to.be.equal(true);
      await expect(tx)
        .to.emit(this.contracts.flashLoan, "AddressesSet")
        .withArgs(stableCoinAddress, swapRouterAddress);
    });

    context("when setting zero address", function () {
      it("should revert custom error when stablecoin address is zero", async function () {
        const stableCoinAddress = ethers.ZeroAddress;
        const swapRouterAddress = this.signers.accounts[1].address;

        await expect(
          this.contracts.flashLoan.setInternalAddresses(stableCoinAddress, swapRouterAddress)
        ).to.be.revertedWithCustomError(this.contracts.flashLoan, "FlashLoan__ZeroAddresses");
      });

      it("should revert custom error when swapRouter addres is zero", async function () {
        const stableCoinAddress = this.signers.accounts[1].address;
        const swapRouterAddress = ethers.ZeroAddress;

        await expect(
          this.contracts.flashLoan.setInternalAddresses(stableCoinAddress, swapRouterAddress)
        ).to.be.revertedWithCustomError(this.contracts.flashLoan, "FlashLoan__ZeroAddresses");
      });
    });
  });

  context("when called by non-owner", function () {
    it("should revert OwnableUnauthorizedAccount", async function () {
      const stableCoinAddress = this.signers.accounts[1].address;
      const swapRouterAddress = this.signers.accounts[2].address;

      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.flashLoan
          .connect(notOwner)
          .setInternalAddresses(stableCoinAddress, swapRouterAddress)
      )
        .to.be.revertedWithCustomError(this.contracts.flashLoan, "OwnableUnauthorizedAccount")
        .withArgs(notOwner.address);
    });
  });
}
