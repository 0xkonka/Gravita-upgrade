import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

import type { AdminContract, AdminContract__factory } from "../../../types";

export async function adminContractFixture(): Promise<{
  adminContract: AdminContract;
}> {
  const signers = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const AdminContractFactory: AdminContract__factory = (await ethers.getContractFactory(
    "AdminContract"
  )) as AdminContract__factory;

  type DeployArgs = Parameters<typeof AdminContractFactory.deploy>;
  const args: DeployArgs = [];

  const adminContract: AdminContract = (await AdminContractFactory.connect(deployer).deploy(
    ...args
  )) as AdminContract;
  await adminContract.waitForDeployment();

  return { adminContract };
}
