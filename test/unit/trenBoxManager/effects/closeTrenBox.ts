import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanCloseTrenBox(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;
    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.user = [this.signers.accounts[2], this.signers.accounts[3]];

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

    await debtToken.setAddresses(borrowerOperations, this.contracts.stabilityPool, trenBoxManager);
    await debtToken.addWhitelist(feeCollector);

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.borrowerOperations = borrowerOperations;
    this.redeployedContracts.debtToken = debtToken;
    this.redeployedContracts.feeCollector = feeCollector;
    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;
    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    const { erc20 } = this.testContracts;

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
    });

    await this.utils.connectRedeployedContracts({
      trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      borrowerOperations: this.redeployedContracts.borrowerOperations,
      debtToken: this.redeployedContracts.debtToken,
      feeCollector: this.redeployedContracts.feeCollector,
      sortedTrenBoxes: this.redeployedContracts.sortedTrenBoxes,
      trenBoxStorage: this.redeployedContracts.trenBoxStorage,
      trenBoxManager: this.redeployedContracts.trenBoxManager,
    });
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = ethers.parseUnits("100", 30);
      const mintCap = ethers.parseUnits("200", 35);

      await this.contracts.adminContract.setMintCap(erc20, mintCap);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.user[0],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();
    });

    it("should revert with custom error", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.user[0].address;

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(1n);

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .closeTrenBox(erc20, borrower)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxManager,
        "TrenBoxManager__OnlyOneTrenBox"
      );
    });

    it("should close trenBox and emit TrenBoxIndexUpdated", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.user[0].address;
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.user[1],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(1n);

      const increaseDebtTx = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .closeTrenBox(erc20, borrower);

      await expect(increaseDebtTx)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxIndexUpdated")
        .withArgs(erc20, this.user[1].address, 0n);

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(2n);
    });
  });

  context("when caller is not trenBoxManagerOperations or borrowerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];

      await expect(
        this.redeployedContracts.trenBoxManager.closeTrenBox(wETH.address, borrower)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperationsOrBorrowerOperations"
      );
    });
  });
}
