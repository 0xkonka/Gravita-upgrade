import { BaseContract } from "ethers";
import { Context } from "mocha";

import { BatchLiquidateTrenBoxesArgs, BatchLiquidateTrenBoxesResult } from "../shared/types";

export function batchLiquidateTrenBoxes(context: Context) {
  return async function (
    args: BatchLiquidateTrenBoxesArgs
  ): Promise<BatchLiquidateTrenBoxesResult> {
    const { from, overrideTrenBoxManagerOperations, asset, trenBoxes } = args;

    const trenBoxManagerOperations =
      overrideTrenBoxManagerOperations || context.contracts.trenBoxManagerOperations;

    const assetAddress = asset instanceof BaseContract ? await asset.getAddress() : asset;

    return trenBoxManagerOperations.connect(from).batchLiquidateTrenBoxes(assetAddress, trenBoxes);
  };
}
