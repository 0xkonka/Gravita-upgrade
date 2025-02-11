import { Context } from "mocha";

import { SetupCollateralForTestsArgs } from "../shared/types";

export function setupCollateralForTests(context: Context) {
  return async (args: SetupCollateralForTestsArgs) => {
    const { collateral, collateralOptions, overrideAdminContract, overridePriceFeed } = args;
    const debtTokenGasCompensation = collateralOptions.debtTokenGasCompensation || 0n;

    const adminContract = overrideAdminContract || context.contracts.adminContract;
    const priceFeed = overridePriceFeed || context.testContracts.priceFeedTestnet;

    const collateralAddress = await collateral.getAddress();

    await adminContract.addNewCollateral(collateralAddress, debtTokenGasCompensation);

    if (collateralOptions.setCollateralParams) {
      await adminContract.setCollateralParameters(
        collateralAddress,
        collateralOptions.setCollateralParams.borrowingFee,
        collateralOptions.setCollateralParams.criticalCollateralRate,
        collateralOptions.setCollateralParams.minimumCollateralRatio,
        collateralOptions.setCollateralParams.minNetDebt,
        collateralOptions.setCollateralParams.mintCap,
        collateralOptions.setCollateralParams.percentDivisor,
      );
    } else if (args.collateralOptions.setAsActive) {
      await adminContract.setIsActive(collateralAddress, true);
    }

    if (collateralOptions.mintCap) {
      await adminContract.setMintCap(collateralAddress, collateralOptions.mintCap);
    }

    if (collateralOptions.mints) {
      for (const mint of collateralOptions.mints) {
        await collateral.mint(mint.to, mint.amount);
      }
    }

    if (collateralOptions.approve) {
      for (const approve of collateralOptions.approve) {
        await collateral.connect(approve.from).approve(approve.spender, approve.amount);
      }
    }

    await priceFeed.setPrice(collateralAddress, collateralOptions.price);
  };
}
