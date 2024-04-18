import type { DeployFunction, DeployResult } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { isLocalhostNetwork } from "../utils/networks";
import { verifyContract } from "../utils/verify";
import { generateSalt } from "../utils/misc";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deterministic } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await preDeploy(deployer, "ActivePool");
  const deterministicDeploy = await deterministic("ActivePool", {
    from: deployer,
    proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [deployer],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
    log: true,
    autoMine: true,
    salt: generateSalt("TREN"),
  });

  const deployResult: DeployResult = await deterministicDeploy.deploy();

  // You don't want to verify on localhost
  if (isLocalhostNetwork(chainId) === false) {
    const contractPath = `contracts/ActivePool.sol:ActivePool`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
      isUpgradeable: true,
    });
  }
};

export default func;
func.id = "deploy_activePool";
func.tags = ["ActivePool"];
