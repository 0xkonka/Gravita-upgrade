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
      await contracts.activePool.getAddress(),
      await contracts.adminContract.getAddress(),
      await contracts.borrowerOperations.getAddress(),
      await contracts.collSurplusPool.getAddress(),
      await contracts.debtToken.getAddress(),
      await contracts.defaultPool.getAddress(),
      await contracts.feeCollector.getAddress(),
      await contracts.gasPool.getAddress(),
      await contracts.priceFeed.getAddress(),
      await contracts.sortedTrenBoxes.getAddress(),
      await contracts.stabilityPool.getAddress(),
      await contracts.timelock.getAddress(),
      await treasury.getAddress(),
      await contracts.trenBoxManager.getAddress(),
      await contracts.trenBoxManagerOperations.getAddress(),
    ]);

    return addressesForSetAddresses;
  };
}