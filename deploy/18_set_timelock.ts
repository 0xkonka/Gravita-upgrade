/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  const contracts_to_be_managed_by_timelock: string[] = [];

  for (const contractName of contracts_to_be_managed_by_timelock) {
    const contractDeployment = await deployments.get(contractName);
    const contract = await ethers.getContractAt(contractName, contractDeployment.address);

    const setSetupsInitializedTx = await contract.setSetupsInitialized();
    await setSetupsInitializedTx.wait();

    console.log(`⛓️ ${chalk.cyan(contractName)}: contract is now managed by Timelock`);
  }
};

export default func;
func.id = "set_timelock";
func.tags = [];
