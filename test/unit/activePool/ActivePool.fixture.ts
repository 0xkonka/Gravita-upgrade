import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

import type { ActivePool, ActivePool__factory } from "../../../types";

export async function activePoolFixture(): Promise<{
  activePool: ActivePool
}> {
  const signers = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const ActivePoolFactory: ActivePool__factory = (await ethers.getContractFactory(
    "ActivePool"
  )) as ActivePool__factory;

  type DeployArgs = Parameters<typeof ActivePoolFactory.deploy>;
  const args: DeployArgs = [];

  const activePool: ActivePool = (await ActivePoolFactory.connect(deployer).deploy(
    ...args
  )) as ActivePool;
  await activePool.waitForDeployment();

  return { activePool };
}
