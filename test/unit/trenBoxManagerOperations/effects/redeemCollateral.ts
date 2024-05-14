import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeRedeemCollateral(): void {
  context("when execute with not correct redemptionBlockTimestamp", function () {
    beforeEach(async function () {});

    it("should revert with custom error TrenBoxManagerOperations__RedemptionIsBlocked", async function () {
      const { wETH } = this.collaterals.active;

      await expect(
        this.contracts.trenBoxManagerOperations.redeemCollateral(
          wETH.address,
          0,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          0,
          0
        )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__RedemptionIsBlocked"
      );
    });
  });

  context("when execute with not correct redemptionFeeFloor", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const users = [this.signers.accounts[1], this.signers.accounts[2]];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__FeePercentOutOfBounds", async function () {
      const { erc20 } = this.testContracts;

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);

      await expect(
        this.contracts.trenBoxManagerOperations.redeemCollateral(
          erc20,
          ethers.parseUnits("2000", 18),
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          0,
          0
        )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__FeePercentOutOfBounds"
      );
    });
  });

  context("when execute with not correct debtToken amount", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const users = [this.signers.accounts[1], this.signers.accounts[2]];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__EmptyAmount", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);

      await expect(
        this.contracts.trenBoxManagerOperations.redeemCollateral(
          erc20,
          0,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          0,
          ethers.parseEther("0.002")
        )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__EmptyAmount"
      );
    });
  });

  context("when execute with not enough redeemer's debtToken balance", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const users = [this.signers.accounts[1], this.signers.accounts[2]];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__InsufficientDebtTokenBalance", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);

      await expect(
        this.contracts.trenBoxManagerOperations.redeemCollateral(
          erc20,
          ethers.parseUnits("20", "ether"),
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          0,
          ethers.parseEther("0.002")
        )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__InsufficientDebtTokenBalance"
      );
    });
  });

  context("when execute with TCR less than MCR", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("1", 21);
      const users = [this.signers.accounts[1], this.signers.accounts[2]];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: assetAddress,
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__TCRMustBeAboveMCR", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      await expect(
        this.contracts.trenBoxManagerOperations
          .connect(this.signers.accounts[2])
          .redeemCollateral(
            erc20,
            ethers.parseUnits("20", "ether"),
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            0,
            ethers.parseEther("0.002")
          )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__TCRMustBeAboveMCR"
      );
    });
  });

  context("when execute with no redemptionSofteningParam", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("1", 21);
      const users = [this.signers.accounts[1], this.signers.accounts[2], this.signers.accounts[3]];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: assetAddress,
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__UnableToRedeemAnyAmount", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("3", "ether"));

      const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20);

      await expect(
        this.contracts.trenBoxManagerOperations
          .connect(this.signers.accounts[2])
          .redeemCollateral(
            erc20,
            minDebt - ethers.parseEther("200"),
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            0,
            1n,
            ethers.parseEther("0.002")
          )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__UnableToRedeemAnyAmount"
      );
    });
  });

  context("when execute with correct values", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;
      this.timeLockImpostor = this.signers.accounts[7];
      const users = [this.signers.accounts[1], this.signers.accounts[2], this.signers.accounts[3]];

      const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
      const trenBoxStorage = await TrenBoxStorageFactory.connect(owner).deploy();
      await trenBoxStorage.waitForDeployment();
      await trenBoxStorage.initialize(this.signers.deployer);

      const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
      const trenBoxManager = await TrenBoxManagerFactory.connect(owner).deploy();
      await trenBoxManager.waitForDeployment();
      await trenBoxManager.initialize(this.signers.deployer);

      const TrenBoxManagerOperationsFactory = await ethers.getContractFactory(
        "TrenBoxManagerOperations"
      );
      const trenBoxManagerOperations =
        await TrenBoxManagerOperationsFactory.connect(owner).deploy();
      await trenBoxManagerOperations.waitForDeployment();
      await trenBoxManagerOperations.initialize(this.signers.deployer);

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

      await debtToken.setAddresses(
        borrowerOperations,
        this.contracts.stabilityPool,
        trenBoxManager
      );
      await debtToken.addWhitelist(feeCollector);

      this.redeployedContracts.trenBoxManager = trenBoxManager;
      this.redeployedContracts.borrowerOperations = borrowerOperations;
      this.redeployedContracts.debtToken = debtToken;
      this.redeployedContracts.feeCollector = feeCollector;
      this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;
      this.redeployedContracts.trenBoxStorage = trenBoxStorage;
      this.redeployedContracts.trenBoxManagerOperations = trenBoxManagerOperations;

      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.redeployedContracts.trenBoxManagerOperations,
        borrowerOperations: this.redeployedContracts.borrowerOperations,
        debtToken: this.redeployedContracts.debtToken,
        feeCollector: this.redeployedContracts.feeCollector,
        sortedTrenBoxes: this.redeployedContracts.sortedTrenBoxes,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        timelock: this.timeLockImpostor,
      });

      const { erc20 } = this.testContracts;
      const mintCap = ethers.parseUnits("200", 35);
      const assetAmount = ethers.parseUnits("5", 21);

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
      });

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        extraDebtTokenAmount: ethers.parseUnits("1000", "ether"),
        from: this.signers.accounts[1],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();
    });

    it("should execute redeemCollateral and emit Redemption", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");
      const assetAmount = ethers.parseUnits("1", 21);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        extraDebtTokenAmount: ethers.parseUnits("2000", "ether"),
        from: this.signers.accounts[2],
        overrideTrenBoxManager: this.redeployedContracts.trenBoxManager,
        overrideBorrowerOperations: this.redeployedContracts.borrowerOperations,
      });

      await (await openTrenBoxTx).wait();

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);
      await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.timeLockImpostor)
        .setRedemptionSofteningParam(10000n);

      const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20);
      const debtTokenAmount = minDebt - ethers.parseEther("200");
      const totalCollDrawn = debtTokenAmount / 20n;

      const tx = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.signers.accounts[2])
        .redeemCollateral(
          erc20,
          debtTokenAmount,
          this.signers.accounts[1].address,
          this.signers.accounts[1].address,
          this.signers.accounts[1].address,
          BigInt(41176470588235294117n),
          1n,
          ethers.parseEther("0.2")
        );

      const collFee = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20,
        totalCollDrawn
      );

      await expect(tx)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(erc20, debtTokenAmount, debtTokenAmount, totalCollDrawn, collFee);
    });
  });
}
