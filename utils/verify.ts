/* eslint-disable @typescript-eslint/no-explicit-any */
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import type { TransactionResponse } from "ethers";
import { ethers, run } from "hardhat";

import { delayLog } from "./misc";

/**
 * Waits for the specified number of confirmations for a given transaction.
 *
 * @param tx - The transaction response to wait for confirmations.
 * @param waitConfirmations - The number of confirmations to wait for. Default is 5.
 * @returns A promise that resolves when the specified number of confirmations have been received.
 */
export async function waitForConfirmations(
  tx: TransactionResponse,
  waitConfirmations: number = 5
): Promise<void> {
  if (!tx) {
    return;
  }
  console.log(`Waiting for ${waitConfirmations} confirmations...`);
  await tx.wait(waitConfirmations);
}

/**
 * Interface for the input parameters of `verifyContract` function.
 */
interface VerifyContractParams {
  contractAddress: string;
  args?: any[];
  contractPath?: string;
  isUpgradeable?: boolean;
  delay?: number;
}

/**
 * Programmatically verify the given contract using the specified parameters.
 *
 * @param params - The parameters for contract verification.
 * @returns A promise that resolves when the contract has been verified.
 */
export async function verifyContract({
  contractAddress,
  args = [],
  contractPath,
  isUpgradeable = false,
  delay = 20_000,
}: VerifyContractParams): Promise<void> {
  await delayLog(delay);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      contract: contractPath,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(error);
    }
  }

  if (isUpgradeable) {
    const implAddress = await getImplementationAddress(ethers.provider, contractAddress);
    try {
      await run("verify:verify", {
        address: implAddress,
      });
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Already verified!");
      } else {
        console.log(error);
      }
    }
  }
}
