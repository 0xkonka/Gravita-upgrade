import { ethers } from "hardhat";
import { Context } from "mocha";

import { RepayDebtArgs, RepayDebtResult } from "../shared/types";

export function repayDebt(context: Context) {
  return async function (args: RepayDebtArgs): Promise<RepayDebtResult> {
    const {
      from,
      collateral,
      debtAmount,
      upperHint,
      lowerHint,
      overrideBorrowerOperations,
      autoApprove,
    } = args;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;
    const debtToken = args.overrideDebtToken || context.contracts.debtToken;

    if (autoApprove) {
      const borrowerOperationsAddress = await borrowerOperations.getAddress();

      await debtToken.connect(from).approve(borrowerOperationsAddress, debtAmount);
    }

    const collateralAddress = await collateral.getAddress();

    return borrowerOperations
      .connect(from)
      .repayDebtTokens(
        collateralAddress,
        debtAmount,
        upperHint || ethers.ZeroAddress,
        lowerHint || ethers.ZeroAddress
      );
  };
}
