/* eslint-disable @typescript-eslint/no-explicit-any */
import { NETWORKS } from "../config/networks";

/**
 * Checks if the network is a localhost network.
 *
 * @param chainId - The chain ID of the network.
 * @returns A boolean indicating whether the network is a localhost network.
 */
export function isLocalhostNetwork(chainId: string): boolean {
  return chainId === "31337" || chainId === "1337" || chainId === "1771" || chainId === "34443";
}

/**
 * Checks if the network is a layer 2 network.
 *
 * @param chainId - The chain ID of the network.
 * @returns A boolean indicating whether the network is a layer 2 network.
 */
export function isLayer2Network(chainId: string): boolean {
  for (const networkConfig of Object.values(NETWORKS)) {
    if (networkConfig.chainId === Number(chainId) && networkConfig.isLayer2) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the network is a supported network.
 *
 * @param chainId - The chain ID of the network.
 * @returns A boolean indicating whether the network is a supported network.
 */
export function isSupportedNetwork(chainId: string) {
  for (const networkConfig of Object.values(NETWORKS)) {
    if (networkConfig.chainId === Number(chainId)) {
      return true;
    }
  }

  return isLocalhostNetwork(chainId);
}
