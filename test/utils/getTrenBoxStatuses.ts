import { Context } from "mocha";

import type { GetTrenBoxStatusArgs } from "../shared/types";

export function getTrenBoxStatuses(context: Context) {
  return async function (args: GetTrenBoxStatusArgs) {
    const { asset, borrowers, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const results = [];

    for (const borrower of borrowers) {
      const trenBoxStatus = await trenBoxManager.getTrenBoxStatus(asset, borrower);
      results.push(trenBoxStatus);
    }

    return results;
  };
}
