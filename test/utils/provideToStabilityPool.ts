import { BaseContract } from "ethers";
import { Context } from "mocha";

import { ProvideToStabilityPoolArgs, ProvideToStabilityPoolResult } from "../shared/types";

export function provideToStabilityPool(context: Context) {
  return async function (args: ProvideToStabilityPoolArgs): Promise<ProvideToStabilityPoolResult> {
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

    return stabilityPool.connect(from).provideToSP(amount, assetAddresses);
  };
}
