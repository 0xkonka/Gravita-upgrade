import { ethers } from "ethers";
import { Context } from "mocha";

import { WithdrawCollateralArgs, WithdrawCollateralResult } from "../shared/types";

export function withdrawCollateral(context: Context) {
  return async function (args: WithdrawCollateralArgs): Promise<WithdrawCollateralResult> {
    const { from, amount, collateral, upperHint, lowerHint, overrideBorrowerOperations } = args;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;

    const collateralAddress = await collateral.getAddress();

    return borrowerOperations
      .connect(from)
      .withdrawColl(
        collateralAddress,
        amount,
        upperHint || ethers.ZeroAddress,
        lowerHint || ethers.ZeroAddress
      );
  };
}
