import { Context } from "mocha";

import type { GetCompositeDebtArgs } from "../shared/types";

export function getCompositeDebt(context: Context) {
  return async function (args: GetCompositeDebtArgs) {
    const { asset, debtTokenAmount, overrideBorrowerOperations } = args;
    const borrowerOperations = overrideBorrowerOperations || context.contracts.borrowerOperations;

    const compositeDebt = await borrowerOperations.getCompositeDebt(asset, debtTokenAmount);

    return compositeDebt;
  };
}
