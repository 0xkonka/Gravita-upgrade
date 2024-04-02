import { ethers } from "hardhat";
import { Context } from "mocha";

import { TakeDebtArgs, TakeDebtResult } from "../shared/types";

export function takeDebt(context: Context) {
  return async function (args: TakeDebtArgs): Promise<TakeDebtResult> {
    const { from, collateral, debtAmount, upperHint, lowerHint, overrideBorrowerOperations } = args;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;

    const collateralAddress = await collateral.getAddress();

    return borrowerOperations
      .connect(from)
      .withdrawDebtTokens(
        collateralAddress,
        debtAmount,
        upperHint || ethers.ZeroAddress,
        lowerHint || ethers.ZeroAddress
      );
  };
}
