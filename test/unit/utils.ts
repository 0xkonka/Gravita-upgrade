import { ethers, network } from "hardhat";
import { Context } from "mocha";

import type {
  GetActualDebtFromCompositeDebtArgs,
  GetAddressesForSetAddressesOverrides,
  GetAddressesForSetAddressesResult,
  GetCompositeDebtArgs,
  GetNetBorrowingAmountArgs,
  GetOpenTrenBoxTotalDebtArgs,
  OpenTrenBoxArgs,
  TestUtils,
} from "../shared/types";

function getAddressesForSetAddresses(context: Context) {
  return async function (
    overrides?: GetAddressesForSetAddressesOverrides
  ): Promise<GetAddressesForSetAddressesResult> {
    overrides = overrides || {};
    const contracts = { ...context.contracts, ...overrides };
    const treasury = overrides.treasury || context.signers.treasury;

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
}

function getCompositeDebt(context: Context) {
  return async function (args: GetCompositeDebtArgs) {
    const { asset, debtTokenAmount, overrideBorrowerOperations } = args;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;

    const compositeDebt = await borrowerOperations.getCompositeDebt(asset, debtTokenAmount);

    return compositeDebt;
  };
}

function getNetBorrowingAmount(context: Context) {
  return async function (args: GetNetBorrowingAmountArgs) {
    const { asset, debtWithFees, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const borrowingRate = await trenBoxManager.getBorrowingRate(asset);

    return (debtWithFees * ethers.WeiPerEther) / (ethers.WeiPerEther + borrowingRate);
  };
}

function getActualDebtFromCompositeDebt(context: Context) {
  return async (args: GetActualDebtFromCompositeDebtArgs) => {
    const { asset, compositeDebt, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const issuedDebt = await trenBoxManager.getNetDebt(asset, compositeDebt);

    return issuedDebt;
  };
}

function getOpenTrenBoxTotalDebt(context: Context) {
  return async (args: GetOpenTrenBoxTotalDebtArgs) => {
    const { asset, debtTokenAmount, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const fee = await trenBoxManager.getBorrowingFee(asset, debtTokenAmount);
    const compositeDebt = await context.utils.getCompositeDebt(args);

    return fee + compositeDebt;
  };
}

function openTrenBox(context: Context) {
  return async (args: OpenTrenBoxArgs) => {
    const defaultArgs = {
      upperHint: ethers.ZeroAddress,
      lowerHint: ethers.ZeroAddress,
      extraDebtTokenAmount: 0n,
      from: context.signers.deployer,
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

    const adminContract = overrideAdminContract || context.contracts.adminContract;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const minNetDebt = await adminContract.getMinNetDebt(asset);

    const netBorrowingAmount = await context.utils.getNetBorrowingAmount({
      asset,
      debtWithFees: minNetDebt,
    });

    const minDebt = netBorrowingAmount + 1n;
    const debtTokenAmount = minDebt + extraDebtTokenAmount;

    const totalDebt = await context.utils.getOpenTrenBoxTotalDebt({
      asset,
      debtTokenAmount,
      overrideBorrowerOperations: borrowerOperations,
      overrideTrenBoxManager: trenBoxManager,
    });

    const netDebt = await context.utils.getActualDebtFromCompositeDebt({
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
}

export function setupUtils(context: Context): TestUtils {
  return {
    revertToInitialSnapshot: async () => {
      await network.provider.send("evm_revert", [context.initialSnapshotId]);
    },
    getAddressesForSetAddresses: getAddressesForSetAddresses(context),
    getNetBorrowingAmount: getNetBorrowingAmount(context),
    getCompositeDebt: getCompositeDebt(context),
    getOpenTrenBoxTotalDebt: getOpenTrenBoxTotalDebt(context),
    getActualDebtFromCompositeDebt: getActualDebtFromCompositeDebt(context),
    openTrenBox: openTrenBox(context),
  };
}
