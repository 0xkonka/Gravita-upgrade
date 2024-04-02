import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BaseContract } from "ethers";
import { Context } from "mocha";

import { LiquidateArgs, LiquidateResult } from "../shared/types";

export function liquidate(context: Context) {
  return async function (args: LiquidateArgs): Promise<LiquidateResult> {
    const { from, asset, borrower, overrideTrenBoxManagerOperations } = args;
    const trenBoxManagerOperations =
      overrideTrenBoxManagerOperations || context.contracts.trenBoxManagerOperations;

    const assetAddress = asset instanceof BaseContract ? await asset.getAddress() : asset;
    const borrowerAddress =
      borrower instanceof HardhatEthersSigner ? await borrower.getAddress() : borrower;

    return trenBoxManagerOperations.connect(from).liquidate(assetAddress, borrowerAddress);
  };
}
