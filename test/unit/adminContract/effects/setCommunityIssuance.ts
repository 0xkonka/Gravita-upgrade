import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetCommunityIssuance(): void {
  context("when the caller is the owner", function () {
    context("when address is valid", function () {
      it("should set address to community issuance", async function () {
        const communityIssuance = this.signers.accounts[2];

        const tx = this.contracts.adminContract.setCommunityIssuance(communityIssuance);

        await expect(tx)
          .to.be.emit(this.contracts.adminContract, "CommunityIssuanceAddressSet")
          .withArgs(communityIssuance);
      });
    });

    context("when address is zero address", function () {
      it("should revert with custom error ConfigurableAddresses__CommunityIssuanceZeroAddress", async function () {
        const zeroAddress = ethers.ZeroAddress;

        const tx = this.contracts.adminContract.setCommunityIssuance(zeroAddress);

        await expect(tx).to.be.revertedWithCustomError(
          this.contracts.adminContract,
          "ConfigurableAddresses__CommunityIssuanceZeroAddress"
        );
      });
    });
  });

  context("when the caller is not the owner", function () {
    it("should revert with custom error OwnableUnauthorizedAccount", async function () {
      const communityIssuance = this.signers.accounts[2];

      const nonOwner = this.signers.accounts[1];

      const tx = this.contracts.adminContract
        .connect(nonOwner)
        .setCommunityIssuance(communityIssuance);

      await expect(tx).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "OwnableUnauthorizedAccount"
      );
    });
  });
}
