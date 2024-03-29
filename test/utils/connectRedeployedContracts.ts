import { Context } from "mocha";

import { Addresses, DebtToken } from "../../types";
import { ConnectRedeployedContractArgs } from "../shared/types";

export function connectRedeployedContracts(context: Context) {
  return async (args: ConnectRedeployedContractArgs) => {
    const addressesForSetAddresses = await context.utils.getAddressesForSetAddresses(args);

    const contracts = Object.entries(args)
      .filter(([name, contract]) => {
        if (name === "treasury") {
          return false;
        }

        const addressableContract = contract as Addresses;

        return addressableContract.setAddresses !== undefined;
      })
      .map(async ([name, contract]) => {
        if (name === "debtToken") {
          const debtToken = contract as DebtToken;

          const borrowerOperationsAddress = args.borrowerOperations
            ? await args.borrowerOperations.getAddress()
            : await context.contracts.borrowerOperations.getAddress();

          const stabilityPoolAddress = args.stabilityPool
            ? await args.stabilityPool.getAddress()
            : await context.contracts.stabilityPool.getAddress();

          const trenBoxManagerAddress = args.trenBoxManager
            ? await args.trenBoxManager.getAddress()
            : await context.contracts.trenBoxManager.getAddress();

          return debtToken.setAddresses(
            borrowerOperationsAddress,
            stabilityPoolAddress,
            trenBoxManagerAddress
          );
        } else {
          const addressableContract = contract as Addresses;

          return addressableContract.setAddresses(addressesForSetAddresses);
        }
      });

    await Promise.all(contracts);
  };
}
