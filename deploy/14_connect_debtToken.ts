/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  const debtTokenDeployment = await deployments.get("DebtToken");
  const debtToken = await ethers.getContractAt("DebtToken", debtTokenDeployment.address);

  const borrowerOperationsDeployment = await deployments.get("BorrowerOperations");
  const stabilityPoolDeployment = await deployments.get("StabilityPool");
  const trenBoxManagerDeployment = await deployments.get("TrenBoxManager");

  const setAddressesTx = await debtToken.setAddresses(
    borrowerOperationsDeployment.address,
    stabilityPoolDeployment.address,
    trenBoxManagerDeployment.address
  );

  await setAddressesTx.wait();

  const connectedBorrowerOperationsAddress = await debtToken.borrowerOperationsAddress();
  const connectedStabilityPoolAddress = await debtToken.stabilityPoolAddress();
  const connectedTrenBoxManagerAddress = await debtToken.trenBoxManagerAddress();

  console.log(
    `⛓️ Connected: ${chalk.cyan("DebtToken")} to ${chalk.cyan("BorrowerOperations")} at ${connectedBorrowerOperationsAddress}, ${chalk.cyan("StabilityPool")} at ${connectedStabilityPoolAddress}, and ${chalk.cyan("TrenBoxManagerOperations")} at ${connectedTrenBoxManagerAddress}`
  );
};

export default func;
func.id = "connect_DebtToken";
func.tags = ["DebtToken"];
