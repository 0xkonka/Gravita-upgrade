import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanOpenTrenBox() {
  context("when asset is active", function () {
    beforeEach(async function () {
      const user = this.signers.accounts[0];

      this.upperHint = ethers.ZeroAddress; // TODO: What's upper hint?
      this.lowerHint = ethers.ZeroAddress;

      const { erc20 } = this.testContracts;

      await this.utils.setupCollateralForTests({
        collateral: erc20,
        collateralOptions: {
          setAsActive: true,
          price: ethers.parseUnits("200", "ether"),
          mints: [
            {
              to: user.address,
              amount: ethers.parseUnits("100", 30),
            },
          ],
        },
      });

      this.user = user;
    });

    it("should open tren box", async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const mintCap = ethers.parseUnits("100", 35);
      await this.contracts.adminContract.setMintCap(assetAddress, mintCap);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: assetAddress,
        assetAmount,
        from: this.user,
      });

      await expect(openTrenBoxTx).to.not.be.rejected;
    });
  });

  context("when asset is not active", function () {
    it("should revert", async function () {
      const notActiveAsset = this.collaterals.inactive.dai;

      const user = this.signers.accounts[0];

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notActiveAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWith("BorrowerOperations: Asset is not active");
    });
  });

  context("when asset is not supported", function () {
    it("should revert", async function () {
      const notSupportedAsset = this.collaterals.notAdded.testCollateral;

      const user = this.signers.accounts[0];

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notSupportedAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWith("collateral does not exist");
    });
  });
}
