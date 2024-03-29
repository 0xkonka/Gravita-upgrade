import { BaseContract } from "ethers";
import { Context } from "mocha";

import { RedeemCollateralArgs, RedeemCollateralResult } from "../shared/types";

export function redeemCollateral(context: Context) {
  return async function (args: RedeemCollateralArgs): Promise<RedeemCollateralResult> {
    const {
      asset,
      price,
      from,
      debtTokenAmount,
      numberOfTrials,
      maxIterations,
      randomSeed,
      maxFeePercentage,
      overrideTrenBoxManagerOperations,
      overridePriceFeed,
      overrideSortedTrenBoxes,
    } = args;

    const priceFeed = overridePriceFeed ?? context.contracts.priceFeed;
    const trenBoxManagerOperations =
      overrideTrenBoxManagerOperations ?? context.contracts.trenBoxManagerOperations;
    const sortedTrenBoxes = overrideSortedTrenBoxes ?? context.contracts.sortedTrenBoxes;

    const assetAddress = asset instanceof BaseContract ? await asset.getAddress() : asset;
    const assetPrice = price ?? (await priceFeed.fetchPrice(assetAddress));

    const redemptionHint = await trenBoxManagerOperations.getRedemptionHints(
      assetAddress,
      debtTokenAmount,
      assetPrice,
      maxIterations ?? 0
    );

    const [firstRedemptionHint, partialRedemptionHintNewICR] = redemptionHint;

    const { hintAddress: approxPartialRedemptionHint } =
      await trenBoxManagerOperations.getApproxHint(
        assetAddress,
        partialRedemptionHintNewICR,
        numberOfTrials ?? 50,
        randomSeed
      );

    const exactPartialRedemptionHint = await sortedTrenBoxes.findInsertPosition(
      assetAddress,
      partialRedemptionHintNewICR,
      approxPartialRedemptionHint,
      approxPartialRedemptionHint
    );

    return trenBoxManagerOperations
      .connect(from)
      .redeemCollateral(
        assetAddress,
        debtTokenAmount,
        firstRedemptionHint,
        exactPartialRedemptionHint[0],
        exactPartialRedemptionHint[1],
        partialRedemptionHintNewICR,
        maxIterations ?? 0,
        maxFeePercentage ?? 0
      );
  };
}
