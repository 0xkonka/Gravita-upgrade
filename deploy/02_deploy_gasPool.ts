import type { AddressLike } from "ethers";
import type { DeployFunction, DeployResult } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { isLocalhostNetwork } from "../utils/networks";
import { verifyContract } from "../utils/verify";
import { generateSalt } from "../utils/misc";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const initialOwner = deployer;

  type ConstructorParams = [AddressLike];
  const args: ConstructorParams = [initialOwner];

  await preDeploy(deployer, "GasPool");
  const deployResult: DeployResult = await deploy("GasPool", {
    from: deployer,
    deterministicDeployment: generateSalt("TREN"),
    args: args,
    log: true,
  });

  // You don't want to verify on localhost
  if (isLocalhostNetwork(chainId) === false) {
    const contractPath = `contracts/GasPool.sol:GasPool`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
    });
  }
};

export default func;
func.id = "deploy_GasPool";
func.tags = ["GasPool"];
