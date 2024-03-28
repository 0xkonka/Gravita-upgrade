import { BaseContract } from "ethers";
import { Context } from "mocha";

import { LiquidateTrenBoxesArgs, LiquidateTrenBoxesResult } from "../shared/types";

export function liquidateTrenBoxes(context: Context) {
  return async function (args: LiquidateTrenBoxesArgs): Promise<LiquidateTrenBoxesResult> {
    const { from, overrideTrenBoxManagerOperations, asset, numberOfTrenBoxes } = args;

    const trenBoxManagerOperations =
      overrideTrenBoxManagerOperations || context.contracts.trenBoxManagerOperations;

    const assetAddress = asset instanceof BaseContract ? await asset.getAddress() : asset;

    return trenBoxManagerOperations
      .connect(from)
      .liquidateTrenBoxes(assetAddress, numberOfTrenBoxes);
  };
}
