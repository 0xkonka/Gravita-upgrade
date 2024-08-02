import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeOffset(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;
    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.user = [this.signers.accounts[2], this.signers.accounts[3]];

    const AdminContractFactory = await ethers.getContractFactory("AdminContract");
    const adminContract = await AdminContractFactory.connect(this.signers.deployer).deploy();
    await adminContract.waitForDeployment();
    await adminContract.initialize(this.signers.deployer);

    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize(this.signers.deployer);

    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(owner).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(owner).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(owner).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize(this.signers.deployer);

    const BorrowerOperationsFactory = await ethers.getContractFactory("BorrowerOperations");
    const borrowerOperations = await BorrowerOperationsFactory.connect(owner).deploy();
    await borrowerOperations.waitForDeployment();
    await borrowerOperations.initialize(this.signers.deployer);

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(owner);
    await debtToken.waitForDeployment();

    await debtToken.addWhitelist(feeCollector);

    this.redeployedContracts.adminContract = adminContract;
    this.redeployedContracts.stabilityPool = stabilityPool;
    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.borrowerOperations = borrowerOperations;
    this.redeployedContracts.debtToken = debtToken;
    this.redeployedContracts.feeCollector = feeCollector;
    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;
    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    const { erc20 } = this.testContracts;

    await this.utils.connectRedeployedContracts({
      trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      adminContract: this.redeployedContracts.adminContract,
      stabilityPool: this.redeployedContracts.stabilityPool,
      borrowerOperations: this.redeployedContracts.borrowerOperations,
      debtToken: this.redeployedContracts.debtToken,
      feeCollector: this.redeployedContracts.feeCollector,
      sortedTrenBoxes: this.redeployedContracts.sortedTrenBoxes,
      trenBoxStorage: this.redeployedContracts.trenBoxStorage,
      trenBoxManager: this.redeployedContracts.trenBoxManager,
    });

    await this.utils.setupCollateralForTests({
      collateral: erc20,
      collateralOptions: {
        setAsActive: true,
        price: ethers.parseUnits("200", "ether"),
        mints: [
          {
            to: this.user[0].address,
            amount: ethers.parseUnits("100", 30),
          },
          {
            to: this.user[1].address,
            amount: ethers.parseUnits("100", 30),
          },
        ],
      },
      overrideAdminContract: this.redeployedContracts.adminContract,
    });
  });

  context("set offset for liquidation", function () {
    context("when caller is trenbox manager", function () {
      beforeEach(async function () {
        const { erc20 } = this.testContracts;
        const assetAmount = ethers.parseUnits("100", 30);
        const mintCap = ethers.parseUnits("200", 35);

        await this.redeployedContracts.adminContract.setMintCap(erc20, mintCap);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: erc20,
          assetAmount,
          from: this.user[0],
          overrideAdminContract: this.redeployedContracts.adminContract,
          overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
          overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
        });

        await (await openTrenBoxTx).wait();

        await this.utils.provideToStabilityPool({
          assets: [erc20],
          amount: 10000000000000n,
          from: this.user[0],
          overrideStabilityPool: this.redeployedContracts.stabilityPool,
        });
      });

      it("in case _debtToOffset is same as total debt deposit", async function () {
        const { erc20 } = this.testContracts;

        const offsetTx = await this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .redistributeDebtAndColl(erc20, 0, 0, 10000000000000n, 100n);

        await expect(offsetTx)
          .to.emit(this.redeployedContracts.stabilityPool, "StabilityPoolDebtTokenBalanceUpdated")
          .withArgs(0);

        await expect(offsetTx)
          .to.emit(this.redeployedContracts.stabilityPool, "EpochUpdated")
          .withArgs(1);

        await expect(offsetTx)
          .to.emit(this.redeployedContracts.stabilityPool, "ScaleUpdated")
          .withArgs(0);
      });

      it("in case _debtToOffset is below total debt deposit", async function () {
        const { erc20 } = this.testContracts;

        const offsetTx = await this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .redistributeDebtAndColl(erc20, 0, 0, 5000000000000n, 100n);

        await expect(offsetTx)
          .to.emit(this.redeployedContracts.stabilityPool, "StabilityPoolDebtTokenBalanceUpdated")
          .withArgs(5000000000000n);
      });

      it("should return null", async function () {
        const { erc20 } = this.testContracts;

        await this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .redistributeDebtAndColl(erc20, 0, 0, 0, 0);
      });
    });

    it("when caller is not trenbox manager", async function () {
      const { erc20 } = this.testContracts;

      await expect(
        this.redeployedContracts.stabilityPool.offset(0, erc20, 0)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.stabilityPool,
        "StabilityPool__TrenBoxManagerOnly"
      );
    });
  });
}
