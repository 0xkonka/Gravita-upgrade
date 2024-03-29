import { BaseContract } from "ethers";
import { Context } from "mocha";

import { CloseTrenBoxArgs, CloseTrenBoxResult } from "../shared/types";

export function closeTrenBox(context: Context) {
  return async (args: CloseTrenBoxArgs): Promise<CloseTrenBoxResult> => {
    const { asset, from, overrideBorrowerOperations } = args;
    const borrowerOperations = overrideBorrowerOperations ?? context.contracts.borrowerOperations;

    const assetAddress = asset instanceof BaseContract ? await asset.getAddress() : asset;

    return borrowerOperations.connect(from).closeTrenBox(assetAddress);
  };
}
