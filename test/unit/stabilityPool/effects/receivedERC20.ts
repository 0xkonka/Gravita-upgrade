import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceivedERC20(): void {
  beforeEach(async function () {
    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize();

    this.redeployedContracts.stabilityPool = stabilityPool;

    const AdminContractFactory = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContractFactory.connect(this.signers.deployer).deploy();
    await adminContract.waitForDeployment();
    await adminContract.initialize();

    this.redeployedContracts.adminContract = adminContract;

    this.activePoolImpostor = this.signers.accounts[1];

    await this.utils.connectRedeployedContracts({
      adminContract: this.redeployedContracts.adminContract,
      stabilityPool: this.redeployedContracts.stabilityPool,
      activePool: this.activePoolImpostor,
    });

    const user = this.signers.accounts[0];
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
      overrideAdminContract: this.redeployedContracts.adminContract,
    });
  });

  context("when caller is active pool", function () {
    it("receives asset token and increase balance", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = 50n;

      const assetBalanceBefore = await this.redeployedContracts.stabilityPool.getCollateral(erc20);

      await this.redeployedContracts.stabilityPool
        .connect(this.activePoolImpostor)
        .receivedERC20(erc20, assetAmount);
      const assetBalanceAfter = await this.redeployedContracts.stabilityPool.getCollateral(erc20);

      expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
    });

    it("should emit StabilityPoolAssetBalanceUpdated", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = 20n;

      const balanceBefore = await this.redeployedContracts.stabilityPool.getCollateral(erc20);

      const receivedERC20Tx = await this.redeployedContracts.stabilityPool
        .connect(this.activePoolImpostor)
        .receivedERC20(erc20, assetAmount);

      await expect(receivedERC20Tx)
        .to.emit(this.redeployedContracts.stabilityPool, "StabilityPoolAssetBalanceUpdated")
        .withArgs(erc20, balanceBefore + assetAmount);
    });
  });

  context("when caller is not active pool", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { erc20 } = this.testContracts;
      const debtAmount = 50n;

      await expect(
        this.contracts.stabilityPool.connect(this.impostor).receivedERC20(erc20, debtAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.stabilityPool,
        "StabilityPool__ActivePoolOnly"
      );
    });
  });
}
