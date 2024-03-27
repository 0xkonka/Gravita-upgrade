import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanExecuteFullRedemption(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;
    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.users = [this.signers.accounts[2], this.signers.accounts[3]];

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(owner).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(owner).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(owner).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize();

    const BorrowerOperationsFactory = await ethers.getContractFactory("BorrowerOperations");
    const borrowerOperations = await BorrowerOperationsFactory.connect(owner).deploy();
    await borrowerOperations.waitForDeployment();
    await borrowerOperations.initialize();

    const CollSurplusPoolFactory = await ethers.getContractFactory("CollSurplusPool");
    const collSurplusPool = await CollSurplusPoolFactory.connect(owner).deploy();
    await collSurplusPool.waitForDeployment();
    await collSurplusPool.initialize();

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize();

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
    this.redeployedContracts.activePool = activePool;
    this.redeployedContracts.collSurplusPool = collSurplusPool;

    const { erc20 } = this.testContracts;

    await this.utils.setupCollateralForTests({
      collateral: erc20,
      collateralOptions: {
        setAsActive: true,
        price: ethers.parseUnits("200", "ether"),
        mints: [
          {
            to: this.users[0].address,
            amount: ethers.parseUnits("100", 30),
          },
          {
            to: this.users[1].address,
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
      activePool: this.redeployedContracts.activePool,
      collSurplusPool: this.redeployedContracts.collSurplusPool,
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
        from: this.users[0],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();
    });

    it("should revert with custom error", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.users[0].address;
      const coll = 10n;

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(1n);

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .executeFullRedemption(erc20, borrower, coll)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxManager,
        "TrenBoxManager__OnlyOneTrenBox"
      );
    });

    it("should execute full redemption and emit TrenBoxUpdated", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.users[0].address;
      const coll = 10n;
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.users[1],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(1n);

      const increaseDebtTx = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .executeFullRedemption(erc20, borrower, coll);

      await expect(increaseDebtTx)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, borrower, 0n, 0n, 0n, 3n);

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(erc20, borrower)
      ).to.be.equal(4n);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[4];
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[2];
      const coll = 10n;

      await expect(
        this.contracts.trenBoxManager
          .connect(impostor)
          .executeFullRedemption(wETH.address, borrower, coll)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
