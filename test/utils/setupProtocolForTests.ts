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
        case "openTrenBox":
          await context.utils.openTrenBox({
            ...command.args,
            overrideAdminContract: overrides?.adminContract,
            overrideBorrowerOperations: overrides?.borrowerOperations,
            overrideTrenBoxManager: overrides?.trenBoxManager,
          });
          break;
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
        case "approve":
          await command.args.asset
            .connect(command.args.from)
            .approve(command.args.spender, command.args.amount);
          break;
        default:
          break;
      }
    }
  };
}
