import { ethers } from "hardhat";
import { Context } from "mocha";

import type { OpenTrenBoxArgs } from "../shared/types";

export function openTrenBox(context: Context) {
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
