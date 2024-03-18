import { deployments, ethers } from "hardhat";

import { Contracts } from "../shared/types";

export async function loadDeploymentFixture(): Promise<Contracts> {
  const deploymentSummary = await deployments.fixture();

  const activePool = await ethers.getContractAt(
    "ActivePool",
    deploymentSummary.ActivePool.address
  );

  const adminContract = await ethers.getContractAt(
    "AdminContract",
    deploymentSummary.AdminContract.address
  );

  const borrowerOperations = await ethers.getContractAt(
    "BorrowerOperations",
    deploymentSummary.BorrowerOperations.address
  );

  const stabilityPool = await ethers.getContractAt(
    "StabilityPool",
    deploymentSummary.StabilityPool.address
  );

  const debtToken = await ethers.getContractAt("DebtToken", deploymentSummary.DebtToken.address);

  const trenBoxManager = await ethers.getContractAt(
    "TrenBoxManager",
    deploymentSummary.TrenBoxManager.address
  );

  const lock = await ethers.getContractAt("Lock", deploymentSummary.Lock.address);

  return {
    activePool,
    adminContract,
    borrowerOperations,
    debtToken,
    stabilityPool,
    trenBoxManager,
    lock,
  } as Contracts;
}
