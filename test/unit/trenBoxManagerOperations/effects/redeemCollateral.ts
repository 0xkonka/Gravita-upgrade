import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";

import { ZERO_ADDRESS } from "../../../../utils/constants";

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
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          this.signers.accounts[1].address,
          41176470588235294117n,
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

  context("some scenarios of redemption mechanism", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;
      this.timeLockImpostor = this.signers.accounts[7];

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

      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const erc20Address = await erc20.getAddress();
      const erc20With6DecimalsAddress = await erc20_with_6_decimals.getAddress();
      const assetAmount = ethers.parseUnits("4000", 18);
      const mintCap = ethers.parseUnits("200", 35);
      const users = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
        this.signers.accounts[5],
      ];
      this.redeemer = this.signers.accounts[5];

      await this.utils.setupProtocolForTests({
        overrides: {
          borrowerOperations: this.redeployedContracts.borrowerOperations,
          trenBoxManager: this.redeployedContracts.trenBoxManager,
        },
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("3", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("10000", 18),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: erc20Address,
              assetAmount,
              from: user,
            },
          };
        }),
      });

      await this.utils.setupProtocolForTests({
        overrides: {
          borrowerOperations: this.redeployedContracts.borrowerOperations,
          trenBoxManager: this.redeployedContracts.trenBoxManager,
        },
        collaterals: [
          {
            collateral: erc20_with_6_decimals,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("1", 18),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("5000", 18),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: erc20With6DecimalsAddress,
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should allow redeem user1 and user2 TrenBox by redeemer", async function () {
      const { erc20 } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");

      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);
      await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.timeLockImpostor)
        .setRedemptionSofteningParam(10000n);

      const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20);
      const totalCollDrawn = minDebt / 3n;

      const tx = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20,
          minDebt,
          this.signers.accounts[1].address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          41176470588235294117n,
          1n,
          ethers.parseEther("0.2")
        );

      const collFee = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20,
        totalCollDrawn
      );

      await this.redeployedContracts.debtToken
        .connect(this.signers.accounts[2])
        .transfer(this.redeemer.address, ethers.parseEther("200"));

      const tx2 = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20,
          minDebt,
          this.signers.accounts[2].address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          41176470588235294117n,
          1n,
          ethers.parseEther("0.3")
        );

      const collFee2 = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20,
        totalCollDrawn
      );

      await expect(tx)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(erc20, minDebt, minDebt, totalCollDrawn, collFee);
      await expect(tx2)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(erc20, minDebt, minDebt, totalCollDrawn, collFee2);
    });

    it("should allow redeem user2 and user4 TrenBoxes with 2 collaterals by redeemer", async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const minFeeFloor = ethers.parseEther("0.001");
      const [user1, user2, user3, user4] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Set params for redemption for erc20 token
      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20, minFeeFloor);
      await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.timeLockImpostor)
        .setRedemptionSofteningParam(10000n);

      const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20);
      const totalCollDrawn = minDebt / 3n;
      const redemptionHint = ZERO_ADDRESS;
      const partialRedemptionHintNICR = 41176470588235294117n;
      const maxFeePerc1Red = ethers.parseEther("0.2");
      const maxFeePerc2Red = ethers.parseEther("0.3");
      const maxIteractions = 1n;

      // User1 and User3 decided to add more collaterals to not be redeemed
      const assetAmountToAdd = ethers.parseEther("1000");
      await this.redeployedContracts.borrowerOperations
        .connect(user1)
        .addColl(erc20, assetAmountToAdd, ZERO_ADDRESS, ZERO_ADDRESS);
      await this.redeployedContracts.borrowerOperations
        .connect(user3)
        .addColl(erc20, assetAmountToAdd, ZERO_ADDRESS, ZERO_ADDRESS);

      // Redeem user2 TrenBox by redemeer
      const redeemUser2 = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20,
          minDebt,
          redemptionHint,
          redemptionHint,
          user2.address,
          partialRedemptionHintNICR,
          maxIteractions,
          maxFeePerc1Red
        );

      // Transfer some trenUSD to redeemer to have possibility for redeemCollateral
      await this.redeployedContracts.debtToken
        .connect(user3)
        .transfer(this.redeemer.address, ethers.parseEther("200"));

      const collFee = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20,
        totalCollDrawn
      );

      // Redeem user4 TrenBox by redemeer
      const redeemUser4 = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20,
          minDebt,
          redemptionHint,
          redemptionHint,
          user4.address,
          partialRedemptionHintNICR,
          maxIteractions,
          maxFeePerc2Red
        );

      const collFee2 = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20,
        totalCollDrawn
      );

      const user2status = await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(
        erc20,
        user2.address
      );
      const user4status = await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(
        erc20,
        user4.address
      );

      expect(user2status).to.equal(4n);
      expect(user4status).to.equal(4n);

      await expect(redeemUser2)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, user2, 0n, 0n, 0n, 3n);
      await expect(redeemUser2)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(erc20, minDebt, minDebt, totalCollDrawn, collFee);
      await expect(redeemUser4)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, user4, 0n, 0n, 0n, 3n);
      await expect(redeemUser4)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(erc20, minDebt, minDebt, totalCollDrawn, collFee2);

      // Set params for redemption for erc20_with_6_decimals token
      await this.contracts.adminContract.setRedemptionBlockTimestamp(erc20_with_6_decimals, 0);
      await this.contracts.adminContract.setRedemptionFeeFloor(erc20_with_6_decimals, minFeeFloor);

      const totalCollDrawnWithSecToken = minDebt / 1n;

      // User1 and User3 decided to add more collaterals with 6 decimals token to not be redeemed
      const assetAmountToAddWithSecToken = ethers.parseEther("1000");
      await this.redeployedContracts.borrowerOperations
        .connect(user1)
        .addColl(erc20_with_6_decimals, assetAmountToAddWithSecToken, ZERO_ADDRESS, ZERO_ADDRESS);
      await this.redeployedContracts.borrowerOperations
        .connect(user3)
        .addColl(erc20_with_6_decimals, assetAmountToAddWithSecToken, ZERO_ADDRESS, ZERO_ADDRESS);

      // Transfer more trenUSD to redeemer to have possibility for redeemCollateral
      await this.redeployedContracts.debtToken
        .connect(user3)
        .transfer(this.redeemer.address, ethers.parseEther("2000"));

      // Redeem user2 TrenBox by redemeer
      const redeemUser2WithSecToken = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20_with_6_decimals,
          minDebt,
          redemptionHint,
          redemptionHint,
          user2.address,
          partialRedemptionHintNICR,
          maxIteractions,
          maxFeePerc1Red
        );

      const collFeeWithSecToken = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20_with_6_decimals,
        totalCollDrawnWithSecToken
      );

      // Transfer more trenUSD to redeemer to have possibility for redeemCollateral
      await this.redeployedContracts.debtToken
        .connect(user1)
        .transfer(this.redeemer.address, ethers.parseEther("2000"));

      // Redeem user4 TrenBox by redemeer
      const redeemUser4WithSecToken = await this.redeployedContracts.trenBoxManagerOperations
        .connect(this.redeemer)
        .redeemCollateral(
          erc20_with_6_decimals,
          minDebt,
          redemptionHint,
          redemptionHint,
          user4.address,
          partialRedemptionHintNICR,
          maxIteractions,
          maxFeePerc2Red
        );

      const collFee2WithSecToken = await this.redeployedContracts.trenBoxManager.getRedemptionFee(
        erc20_with_6_decimals,
        totalCollDrawnWithSecToken
      );

      const user2StatusWithSecToken =
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(
          erc20_with_6_decimals,
          user2.address
        );
      const user4StatusWithSecToken =
        await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(
          erc20_with_6_decimals,
          user4.address
        );

      expect(user2StatusWithSecToken).to.equal(4n);
      expect(user4StatusWithSecToken).to.equal(4n);

      await expect(redeemUser2WithSecToken)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20_with_6_decimals, user2, 0n, 0n, 0n, 3n);
      await expect(redeemUser2WithSecToken)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(
          erc20_with_6_decimals,
          minDebt,
          minDebt,
          totalCollDrawnWithSecToken,
          collFeeWithSecToken
        );
      await expect(redeemUser4WithSecToken)
        .to.emit(this.redeployedContracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20_with_6_decimals, user4, 0n, 0n, 0n, 3n);
      await expect(redeemUser4WithSecToken)
        .to.emit(this.redeployedContracts.trenBoxManagerOperations, "Redemption")
        .withArgs(
          erc20_with_6_decimals,
          minDebt,
          minDebt,
          totalCollDrawnWithSecToken,
          collFee2WithSecToken
        );
    });
  });
}
