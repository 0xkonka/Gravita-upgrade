/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import type { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { isLayer2Network, isLocalhostNetwork, isSupportedNetwork } from "../utils/networks";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId } = hre;
  const { deployer, upgradesAdmin } = await getNamedAccounts();

  const chainId = await getChainId();

  if (deployer === upgradesAdmin) {
    console.log(
      `⛓️ ${chalk.cyan(
        "Deployer"
      )} and ${chalk.cyan("Treasury")} are the same address, skipping renounceOwnership`
    );
    return;
  }

  const contract_to_transfer_ownership = [
    "ActivePool",
    "AdminContract",
    "BorrowerOperations",
    "CollSurplusPool",
    "DebtToken",
    "DefaultPool",
    "FeeCollector",
    "GasPool",
    "SortedTrenBoxes",
    "StabilityPool",
    "TrenBoxManager",
    "TrenBoxManagerOperations",
  ];

  if (isLayer2Network(chainId)) {
    contract_to_transfer_ownership.push("PriceFeedL2");
  } else if (isSupportedNetwork(chainId) && !isLocalhostNetwork(chainId)) {
    contract_to_transfer_ownership.push("PriceFeed");
  }

  for (const contractName of contract_to_transfer_ownership) {
    await transferOwnership(hre, contractName, upgradesAdmin);
  }
};

async function transferOwnership(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  upgradesAdmin: string
) {
  const { deployments, ethers } = hre;

  const contractDeployment = await deployments.get(contractName);
  const contract = await ethers.getContractAt(contractName, contractDeployment.address);

  const currentOwner = await contract.owner();
  if (currentOwner === upgradesAdmin) {
    console.log(
      `⛓️ ${chalk.cyan(contractName)} is already owned by ${chalk.cyan(upgradesAdmin)}, skipping transferOwnership`
    );
    return;
  }

  const transferOwnershipTx = await contract.transferOwnership(upgradesAdmin);
  await transferOwnershipTx.wait();

  console.log(
    `🔑 Transferred ownership of ${chalk.cyan(contractName)} to ${chalk.cyan(upgradesAdmin)}`
  );
}

export default func;
func.id = "transfer_ownership_after_deployment";
func.tags = [];
