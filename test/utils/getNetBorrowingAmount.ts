import { ethers } from "hardhat";
import { Context } from "mocha";

import type { GetNetBorrowingAmountArgs } from "../shared/types";

export function getNetBorrowingAmount(context: Context) {
  return async function (args: GetNetBorrowingAmountArgs) {
    const { asset, debtWithFees, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const borrowingRate = await trenBoxManager.getBorrowingRate(asset);

    return (debtWithFees * ethers.WeiPerEther) / (ethers.WeiPerEther + borrowingRate);
  };
}
