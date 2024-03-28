import { BaseContract } from "ethers";
import { Context } from "mocha";

import { WithdrawFromStabilityPoolArgs, WithdrawFromStabilityPoolResult } from "../shared/types";

export function withdrawFromStabilityPool(context: Context) {
  return async function (
    args: WithdrawFromStabilityPoolArgs
  ): Promise<WithdrawFromStabilityPoolResult> {
    const { from, amount, overrideStabilityPool, assets } = args;

    const stabilityPool = overrideStabilityPool || context.contracts.stabilityPool;

    const assetAddresses = await Promise.all(
      assets.map(async (asset) => {
        if (asset instanceof BaseContract) {
          return await asset.getAddress();
        }

        return asset;
      })
    );

    return stabilityPool.connect(from).withdrawFromSP(amount, assetAddresses);
  };
}
