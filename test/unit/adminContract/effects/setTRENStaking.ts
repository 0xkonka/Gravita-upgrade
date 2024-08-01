import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetTRENStaking(): void {
  context("when the caller is the owner", function () {
    context("when address is valid", function () {
      it("should set address to TRENStaking", async function () {
        const TRENStaking = this.signers.accounts[2];

        const tx = this.contracts.adminContract.setTRENStaking(TRENStaking);

        await expect(tx)
          .to.be.emit(this.contracts.adminContract, "TRENStakingAddressSet")
          .withArgs(TRENStaking);
      });
    });

    context("when address is zero address", function () {
      it("should revert with custom error ConfigurableAddresses__TRENStakingZeroAddress", async function () {
        const zeroAddress = ethers.ZeroAddress;

        const tx = this.contracts.adminContract.setTRENStaking(zeroAddress);

        await expect(tx).to.be.revertedWithCustomError(
          this.contracts.adminContract,
          "ConfigurableAddresses__TRENStakingZeroAddress"
        );
      });
    });
  });

  context("when the caller is not the owner", function () {
    it("should revert with custom error OwnableUnauthorizedAccount", async function () {
      const communityIssuance = this.signers.accounts[2];

      const nonOwner = this.signers.accounts[1];

      const tx = this.contracts.adminContract.connect(nonOwner).setTRENStaking(communityIssuance);

      await expect(tx).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "OwnableUnauthorizedAccount"
      );
    });
  });
}
