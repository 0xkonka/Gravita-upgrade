import { Context } from "mocha";

import { SetupProtocolForTestsArgs } from "../shared/types";

export function setupProtocolForTests(context: Context) {
  return async (args: SetupProtocolForTestsArgs) => {
    const { collaterals, commands, overrides } = args;

    const collateralsToSetup = collaterals || [];
    for (const collateral of collateralsToSetup) {
      await context.utils.setupCollateralForTests(collateral);
    }

    const commandsToRun = commands || [];
    for (const command of commandsToRun) {
      const { action } = command;

      switch (action) {
        case "openTrenBox": {
          const { openTrenBoxTx } = await context.utils.openTrenBox({
            ...command.args,
            overrideAdminContract: overrides?.adminContract,
            overrideBorrowerOperations: overrides?.borrowerOperations,
            overrideTrenBoxManager: overrides?.trenBoxManager,
          });
          await (await openTrenBoxTx).wait();
          break;
        }
        case "addCollateral":
          await context.utils.addCollateral({
            ...command.args,
            overrideBorrowerOperations: overrides?.borrowerOperations,
          });
          break;
        case "withdrawCollateral":
          await context.utils.withdrawCollateral({
            ...command.args,
            overrideBorrowerOperations: overrides?.borrowerOperations,
          });
          break;
        case "takeDebt":
          await context.utils.takeDebt({
            ...command.args,
            overrideBorrowerOperations: overrides?.borrowerOperations,
          });
          break;
        case "repayDebt":
          await context.utils.repayDebt({
            ...command.args,
            overrideBorrowerOperations: overrides?.borrowerOperations,
            overrideDebtToken: overrides?.debtToken,
          });
          break;
        case "provideToStabilityPool":
          await context.utils.provideToStabilityPool({
            ...command.args,
            overrideStabilityPool: overrides?.stabilityPool,
          });
          break;
        case "withdrawFromStabilityPool":
          await context.utils.withdrawFromStabilityPool({
            ...command.args,
            overrideStabilityPool: overrides?.stabilityPool,
          });
          break;
        case "redeemCollateral":
          await context.utils.redeemCollateral({
            ...command.args,
            overrideTrenBoxManagerOperations: overrides?.trenBoxManagerOperations,
            overridePriceFeed: overrides?.priceFeed,
            overrideSortedTrenBoxes: overrides?.sortedTrenBoxes,
          });
          break;
        case "liquidate":
          await context.utils.liquidate({
            ...command.args,
            overrideTrenBoxManagerOperations: overrides?.trenBoxManagerOperations,
          });
          break;
        case "batchLiquidateTrenBoxes":
          await context.utils.batchLiquidateTrenBoxes({
            ...command.args,
            overrideTrenBoxManagerOperations: overrides?.trenBoxManagerOperations,
          });
          break;
        case "liquidateTrenBoxes":
          await context.utils.liquidateTrenBoxes({
            ...command.args,
            overrideTrenBoxManagerOperations: overrides?.trenBoxManagerOperations,
          });
          break;
        case "approve":
          await command.args.asset
            .connect(command.args.from)
            .approve(command.args.spender, command.args.amount);
          break;
        case "closeTrenBox":
          await context.utils.closeTrenBox({
            ...command.args,
            overrideBorrowerOperations: overrides?.borrowerOperations,
          });
          break;
        default:
          throw new Error(`Unknown command: ${action}`);
      }
    }
  };
}
