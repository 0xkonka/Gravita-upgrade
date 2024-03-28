import { ethers } from "hardhat";
import { Context } from "mocha";

import { AddCollateralArgs, AddCollateralResult } from "../shared/types";

export function addCollateral(context: Context) {
  return async function (args: AddCollateralArgs): Promise<AddCollateralResult> {
    const {
      from,
      collateral,
      amount,
      upperHint,
      lowerHint,
      overrideBorrowerOperations,
      autoApprove,
    } = args;

    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;

    if (autoApprove) {
      const borrowerOperationsAddress = await borrowerOperations.getAddress();

      await collateral.approve(borrowerOperationsAddress, amount);
    }

    const collateralAddress = await collateral.getAddress();

    return borrowerOperations
      .connect(from)
      .addColl(
        collateralAddress,
        amount,
        upperHint || ethers.ZeroAddress,
        lowerHint || ethers.ZeroAddress
      );
  };
}
