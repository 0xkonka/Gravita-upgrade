import { Context } from "mocha";

import type {
  GetAddressesForSetAddressesOverrides,
  GetAddressesForSetAddressesResult,
} from "../shared/types";

export function getAddressesForSetAddresses(context: Context) {
  return async function (
    overrides?: GetAddressesForSetAddressesOverrides
  ): Promise<GetAddressesForSetAddressesResult> {
    overrides = overrides || {};
    const contracts = { ...context.contracts, ...overrides };
    const treasury = overrides.treasury || context.signers.treasury;

    const addressesForSetAddresses = await Promise.all([
      await contracts.adminContract.getAddress(),
      await contracts.borrowerOperations.getAddress(),
      await contracts.debtToken.getAddress(),
      await contracts.feeCollector.getAddress(),
      await contracts.flashLoan.getAddress(),
      await contracts.priceFeed.getAddress(),
      await contracts.sortedTrenBoxes.getAddress(),
      await contracts.stabilityPool.getAddress(),
      await contracts.timelock.getAddress(),
      await treasury.getAddress(),
      await contracts.trenBoxManager.getAddress(),
      await contracts.trenBoxManagerOperations.getAddress(),
      await contracts.trenBoxStorage.getAddress(),
    ]);

    return addressesForSetAddresses;
  };
}
