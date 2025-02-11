import type { TransactionResponse } from "ethers";
import { computeAddress, getAddress, solidityPackedKeccak256 } from "ethers";
import { ethers } from "hardhat";

import { fromWei, toGwei } from "./format";

/**
 * Asynchronously sleeps for the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Asynchronously logs a message and waits for the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait.
 */
export async function delayLog(ms: number): Promise<void> {
  console.log(`Waiting for ${ms / 1000}s...`);
  await sleep(ms);
}

/**
 * Checks if the provided address is valid and returns the checksummed address if valid.
 * Otherwise, returns false.
 *
 * @param value - The address to be checked.
 * @returns The checksummed address if valid, or false.
 */
export function isAddress(value: string): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

/**
 * Creates a random checksummed address using the provided salt.
 *
 * @param salt - The salt to generate the address.
 * @returns The checksummed address.
 */
export function createRandomChecksumAddress(salt: string): string {
  const signerAddress: string = computeAddress(solidityPackedKeccak256(["string"], [salt]));
  const checkSummedSignerAddress: string = getAddress(signerAddress);
  return checkSummedSignerAddress;
}

export function generateSalt(input: string) {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(input));
  return hash;
}

/**
 * Retrieves necessary gas information of a transaction.
 *
 * @param tx - The transaction response (e.g., contract deployment or executed transaction).
 * @returns A string containing gas information or null if the transaction is falsy or unsuccessful.
 */
export async function getExtraGasInfo(tx: TransactionResponse): Promise<string | null> {
  if (!tx) {
    return null;
  }

  const gasPrice = tx.gasPrice;
  const gasUsed = tx.gasLimit * gasPrice;
  const txReceipt = await tx.wait();

  if (!txReceipt) {
    return null;
  }

  const gas = txReceipt.gasUsed;
  const extraGasInfo = `${toGwei(gasPrice)} gwei, ${fromWei(gasUsed)} ETH, ${gas} gas, txHash: ${
    tx.hash
  }`;

  return extraGasInfo;
}
