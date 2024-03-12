import { deployments, ethers } from "hardhat";

import { Contracts } from "../shared/types";

export async function loadDeploymentFixture(): Promise<Contracts> {
  const deploymentSummary = await deployments.fixture();

  const adminContract = await ethers.getContractAt(
    "AdminContract",
    deploymentSummary.AdminContract.address
  );

  const stabilityPool = await ethers.getContractAt(
    "StabilityPool",
    deploymentSummary.StabilityPool.address
  );

  const lock = await ethers.getContractAt("Lock", deploymentSummary.Lock.address);

  return { adminContract, stabilityPool, lock } as Contracts;
}
