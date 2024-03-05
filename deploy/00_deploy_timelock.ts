import type { AddressLike, BigNumberish } from "ethers";
import type { DeployFunction, DeployResult } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { verifyContract } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // TODO: Choose values based on current network
  const delay = "172800"; // 2 days
  const adminAddress = deployer;

  type ConstructorParams = [BigNumberish, AddressLike];
  const args: ConstructorParams = [delay, adminAddress];

  await preDeploy(deployer, "Timelock");
  const deployResult: DeployResult = await deploy("Timelock", {
    from: deployer,
    args: args,
    log: true,
  });

  // You don't want to verify on localhost
  if (chainId !== "31337" && chainId !== "1337") {
    const contractPath = `contracts/Timelock.sol:Timelock`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
    });
  }
};

export default func;
func.id = "deploy_timelock";
func.tags = ["Timelock"];
