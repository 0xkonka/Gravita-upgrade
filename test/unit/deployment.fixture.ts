import { deployments, ethers } from "hardhat";

import { Contracts } from "../shared/types";

export async function loadDeploymentFixture(): Promise<Contracts> {
  const deploymentSummary = await deployments.fixture();

  const activePool = await ethers.getContractAt("ActivePool", deploymentSummary.ActivePool.address);

  const adminContract = await ethers.getContractAt(
    "AdminContract",
    deploymentSummary.AdminContract.address
  );

  const borrowerOperations = await ethers.getContractAt(
    "BorrowerOperations",
    deploymentSummary.BorrowerOperations.address
  );

  const collSurplusPool = await ethers.getContractAt(
    "CollSurplusPool",
    deploymentSummary.CollSurplusPool.address
  );

  const debtToken = await ethers.getContractAt("DebtToken", deploymentSummary.DebtToken.address);

  const defaultPool = await ethers.getContractAt(
    "DefaultPool",
    deploymentSummary.DefaultPool.address
  );

  const feeCollector = await ethers.getContractAt(
    "FeeCollector",
    deploymentSummary.FeeCollector.address
  );

  const gasPool = await ethers.getContractAt("GasPool", deploymentSummary.GasPool.address);

  const priceFeed = await ethers.getContractAt(
    "IPriceFeed",
    deploymentSummary.PriceFeedTestnet.address
  );

  const sortedTrenBoxes = await ethers.getContractAt(
    "SortedTrenBoxes",
    deploymentSummary.SortedTrenBoxes.address
  );

  const stabilityPool = await ethers.getContractAt(
    "StabilityPool",
    deploymentSummary.StabilityPool.address
  );

  const timelock = await ethers.getContractAt("Timelock", deploymentSummary.Timelock.address);

  const trenBoxManager = await ethers.getContractAt(
    "TrenBoxManager",
    deploymentSummary.TrenBoxManager.address
  );

  const trenBoxManagerOperations = await ethers.getContractAt(
    "TrenBoxManagerOperations",
    deploymentSummary.TrenBoxManagerOperations.address
  );

  const lock = await ethers.getContractAt("Lock", deploymentSummary.Lock.address);

  return {
    lock,
    activePool,
    adminContract,
    borrowerOperations,
    collSurplusPool,
    debtToken,
    defaultPool,
    feeCollector,
    gasPool,
    priceFeed,
    sortedTrenBoxes,
    stabilityPool,
    timelock,
    trenBoxManager,
    trenBoxManagerOperations,
  };
}
