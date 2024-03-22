import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, getNamedAccounts, getUnnamedAccounts, network } from "hardhat";

import type {
  Contracts,
  GetActualDebtFromCompositeDebtArgs,
  GetAddressesForSetAddressesOverrides,
  GetAddressesForSetAddressesResult,
  GetCompositeDebtArgs,
  GetNetBorrowingAmountArgs,
  GetOpenTrenBoxTotalDebtArgs,
  OpenTrenBoxArgs,
  Signers,
  TestUtils,
} from "../shared/types";
import { testActivePool } from "./activePool/ActivePool";
import { testAdminContract } from "./adminContract/AdminContract";
import { testBorrowerOperations } from "./borrowerOperations/BorrowerOperations";
import { testDebtToken } from "./debtToken/DebtToken";
import { loadDeploymentFixture } from "./deployment.fixture";
import { testLock } from "./lock/Lock";
import { loadTestFixture } from "./testContracts.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;
    this.redeployedContracts = {} as Contracts;
    this.utils = {
      revertToInitialSnapshot: async () => {
        await network.provider.send("evm_revert", [this.initialSnapshotId]);
      },
    } as TestUtils;

    const { deployer, treasury } = await getNamedAccounts();
    const unnamedAccounts = await getUnnamedAccounts();

    this.signers.deployer = await ethers.getSigner(deployer);
    this.signers.treasury = await ethers.getSigner(treasury);
    this.signers.accounts = await Promise.all(
      unnamedAccounts.map((address) => ethers.getSigner(address))
    );

    this.loadFixture = loadFixture;
    this.contracts = await this.loadFixture(loadDeploymentFixture);
    const { testContracts, collaterals } = await this.loadFixture(loadTestFixture);
    this.collaterals = collaterals;
    this.testContracts = testContracts;

    this.initialSnapshotId = await network.provider.send("evm_snapshot", []);
    this.snapshotId = this.initialSnapshotId;

    this.utils.getAddressesForSetAddresses = async (
      overrides?: GetAddressesForSetAddressesOverrides
    ): Promise<GetAddressesForSetAddressesResult> => {
      overrides = overrides || {};
      const contracts = { ...this.contracts, ...overrides };
      const treasury = overrides.treasury || this.signers.treasury;

      const addressesForSetAddresses = await Promise.all([
        await contracts.activePool.getAddress(),
        await contracts.adminContract.getAddress(),
        await contracts.borrowerOperations.getAddress(),
        await contracts.collSurplusPool.getAddress(),
        await contracts.debtToken.getAddress(),
        await contracts.defaultPool.getAddress(),
        await contracts.feeCollector.getAddress(),
        await contracts.gasPool.getAddress(),
        await contracts.priceFeed.getAddress(),
        await contracts.sortedTrenBoxes.getAddress(),
        await contracts.stabilityPool.getAddress(),
        await contracts.timelock.getAddress(),
        await treasury.getAddress(),
        await contracts.trenBoxManager.getAddress(),
        await contracts.trenBoxManagerOperations.getAddress(),
      ]);

      return addressesForSetAddresses;
    };

    this.utils.getNetBorrowingAmount = async (args: GetNetBorrowingAmountArgs) => {
      const { asset, debtWithFees, overrideTrenBoxManager } = args;
      const trenBoxManager = overrideTrenBoxManager || this.contracts.trenBoxManager;

      const borrowingRate = await trenBoxManager.getBorrowingRate(asset);

      return (debtWithFees * ethers.WeiPerEther) / (ethers.WeiPerEther + borrowingRate);
    };

    this.utils.getCompositeDebt = async (args: GetCompositeDebtArgs) => {
      const { asset, debtTokenAmount, overrideBorrowerOperations } = args;
      const borrowerOperations = overrideBorrowerOperations || this.contracts.borrowerOperations;

      const compositeDebt = await borrowerOperations.getCompositeDebt(asset, debtTokenAmount);

      return compositeDebt;
    };

    this.utils.getOpenTrenBoxTotalDebt = async (args: GetOpenTrenBoxTotalDebtArgs) => {
      const { asset, debtTokenAmount, overrideTrenBoxManager } = args;
      const trenBoxManager = overrideTrenBoxManager || this.contracts.trenBoxManager;

      const fee = await trenBoxManager.getBorrowingFee(asset, debtTokenAmount);
      const compositeDebt = await this.utils.getCompositeDebt(args);

      return fee + compositeDebt;
    };

    this.utils.getActualDebtFromCompositeDebt = async (
      args: GetActualDebtFromCompositeDebtArgs
    ) => {
      const { asset, compositeDebt, overrideTrenBoxManager } = args;
      const trenBoxManager = overrideTrenBoxManager || this.contracts.trenBoxManager;

      const issuedDebt = await trenBoxManager.getNetDebt(asset, compositeDebt);

      return issuedDebt;
    };

    this.utils.openTrenBox = async (args: OpenTrenBoxArgs) => {
      const defaultArgs = {
        upperHint: ethers.ZeroAddress,
        lowerHint: ethers.ZeroAddress,
        extraDebtTokenAmount: 0n,
        from: this.signers.deployer,
      };

      const {
        asset,
        assetAmount,
        upperHint,
        lowerHint,
        extraDebtTokenAmount,
        overrideBorrowerOperations,
        overrideAdminContract,
        overrideTrenBoxManager,
        from,
      } = { ...defaultArgs, ...args };

      const adminContract = overrideAdminContract || this.contracts.adminContract;
      const borrowerOperations = overrideBorrowerOperations || this.contracts.borrowerOperations;
      const trenBoxManager = overrideTrenBoxManager || this.contracts.trenBoxManager;

      const minNetDebt = await adminContract.getMinNetDebt(asset);

      const netBorrowingAmount = await this.utils.getNetBorrowingAmount({
        asset,
        debtWithFees: minNetDebt,
      });

      const minDebt = netBorrowingAmount + 1n;
      const debtTokenAmount = minDebt + extraDebtTokenAmount;

      const totalDebt = await this.utils.getOpenTrenBoxTotalDebt({
        asset,
        debtTokenAmount,
        overrideBorrowerOperations: borrowerOperations,
        overrideTrenBoxManager: trenBoxManager,
      });

      const netDebt = await this.utils.getActualDebtFromCompositeDebt({
        asset,
        compositeDebt: totalDebt,
        overrideTrenBoxManager: trenBoxManager,
      });

      const openTrenBoxTx = borrowerOperations
        .connect(from)
        .openTrenBox(asset, assetAmount, debtTokenAmount, upperHint, lowerHint);

      return {
        debtTokenAmount,
        netDebt,
        totalDebt,
        collateralAmount: assetAmount,
        openTrenBoxTx,
      };
    };
  });

  beforeEach(async function () {
    this.snapshotId = await network.provider.send("evm_snapshot");
  });

  afterEach(async function () {
    await network.provider.send("evm_revert", [this.snapshotId]);
  });

  after(async function () {
    await this.utils.revertToInitialSnapshot();
  });

  testActivePool();
  testAdminContract();
  testBorrowerOperations();
  testDebtToken();
  testLock();
});
