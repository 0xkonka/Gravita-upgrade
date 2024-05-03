import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendAsset(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.impostor = this.signers.accounts[1];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(this.redeployedContracts.trenBoxStorage, 5n);
    await erc20.approve(this.impostor, 2n);
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        trenBoxManagerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        stabilityPool: this.impostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context(
    "when caller is not borrower operations, nor tren box manager, nor stability pool, nor tren box manager operations",
    function () {
      it("reverts", async function () {
        const { wETH } = this.collaterals.active;
        const assetAmount = 2n;
        const recipient = this.signers.accounts[2];

        await expect(
          this.contracts.trenBoxStorage
            .connect(this.impostor)
            .sendAsset(wETH.address, recipient, assetAmount)
        ).to.be.revertedWithCustomError(
          this.contracts.trenBoxStorage,
          "TrenBoxStorage__NotAuthorizedContract"
        );
      });
    }
  );
}

function shouldBehaveLikeCanSendAssetCorrectly() {
  it("sends collateral amount correctly", async function () {
    const { trenBoxStorage } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await trenBoxStorage.connect(this.impostor).increaseActiveCollateral(erc20, 50n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];
    const balanceBefore = await erc20.balanceOf(recipient.address);
    const trenBoxStorageBalanceBefore = await erc20.balanceOf(trenBoxStorage);

    await trenBoxStorage.connect(this.impostor).sendAsset(erc20, recipient, assetAmount);
    const balanceAfter = await erc20.balanceOf(recipient.address);
    const trenBoxStorageBalanceAfter = await erc20.balanceOf(trenBoxStorage);

    expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
    expect(trenBoxStorageBalanceAfter).to.be.equal(trenBoxStorageBalanceBefore - assetAmount);
  });

  it("should emit CollateralSent", async function () {
    const { trenBoxStorage } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await trenBoxStorage.connect(this.impostor).increaseActiveCollateral(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await trenBoxStorage
      .connect(this.impostor)
      .sendAsset(erc20, recipient, assetAmount);

    await expect(sendAssetTx)
      .to.emit(trenBoxStorage, "CollateralSent")
      .withArgs(recipient, erc20, 2n);
  });
}
