import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanExecutePartialRedemption(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(owner).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize(this.signers.deployer);

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
    this.redeployedContracts.activePool = activePool;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.user = this.signers.accounts[2];

    const { erc20 } = this.testContracts;

    await this.utils.setupCollateralForTests({
      collateral: erc20,
      collateralOptions: {
        setAsActive: true,
        price: ethers.parseUnits("200", "ether"),
        mints: [
          {
            to: this.user.address,
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
        from: this.user,
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();
    });

    it("should execute partial redemption, emit TrenBoxUpdated and TotalStakesUpdated", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.user;
      const newDebt = 5n;
      const newColl = 10n;
      const newNICR = 2n;
      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      const increaseDebtTx = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .executePartialRedemption(erc20, borrower, newDebt, newColl, newNICR, upperHint, lowerHint);

      await expect(increaseDebtTx)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, borrower, newDebt, newColl, newColl, 3n);

      await expect(increaseDebtTx)
        .to.emit(this.redeployedContracts.trenBoxManager, "TotalStakesUpdated")
        .withArgs(erc20, newColl);

      const debtAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
        erc20,
        borrower
      );
      const collAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxColl(
        erc20,
        borrower
      );

      expect(debtAfter).to.be.equal(newDebt);
      expect(collAfter).to.be.equal(newColl);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];
      const newDebt = 5n;
      const newColl = 10n;
      const newNICR = 2n;
      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.trenBoxManager
          .connect(impostor)
          .executePartialRedemption(
            wETH.address,
            borrower,
            newDebt,
            newColl,
            newNICR,
            upperHint,
            lowerHint
          )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
