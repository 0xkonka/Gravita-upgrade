import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanAddCollateralType(): void {
  beforeEach(async function () {
    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize();

    this.redeployedContracts.stabilityPool = stabilityPool;

    this.adminContractImpostor = this.signers.accounts[1];

    const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
      adminContract: this.adminContractImpostor,
    });

    await this.redeployedContracts.stabilityPool.setAddresses(addressesForSetAddresses);
  });

  context("when caller is Admin Contract", function () {
    it("should add Collateral", async function () {
      const { wETH } = this.collaterals.active;

      await this.redeployedContracts.stabilityPool
        .connect(this.adminContractImpostor)
        .addCollateralType(wETH.address);

      const res = await this.redeployedContracts.stabilityPool.getAllCollateral();

      expect(res[0]).to.be.an("array").that.includes(wETH.address);
      expect(res[1]).to.be.an("array").that.includes(0n);
    });
  });

  context("when caller is not Admin Contract", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[2];
      const { wETH } = this.collaterals.active;

      await expect(
        this.redeployedContracts.stabilityPool.connect(impostor).addCollateralType(wETH.address)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.stabilityPool,
        "StabilityPool__AdminContractOnly"
      );
    });
  });
}
