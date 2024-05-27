import type { DeployFunction, DeployResult, DeploymentsExtension } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import {
  isLayer2Network,
  isLocalhostNetwork,
  isSupportedNetwork,
  shouldVerifyContracts,
} from "../utils/networks";
import { verifyContract } from "../utils/verify";

async function deployLocalhostNetwork(
  deployer: string,
  deploy: DeploymentsExtension["deploy"]
): Promise<void> {
  await preDeploy(deployer, "PriceFeedTestnet");
  await deploy("PriceFeedTestnet", {
    from: deployer,
    log: true,
  });
}

async function deployAndVerifyOnLayer2(
  deployer: string,
  deploy: DeploymentsExtension["deploy"],
  chainId: string
): Promise<void> {
  await preDeploy(deployer, "PriceFeedL2");
  const deployResult: DeployResult = await deploy("PriceFeedL2", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });

  if (shouldVerifyContracts(chainId)) {
    const contractPath = `contracts/Pricing/PriceFeedL2.sol:PriceFeedL2`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
      isUpgradeable: true,
    });
  }
}

async function deployAndVerifyOnLayer1(
  deployer: string,
  deploy: DeploymentsExtension["deploy"],
  chainId: string
): Promise<void> {
  await preDeploy(deployer, "PriceFeed");
  const deployResult: DeployResult = await deploy("PriceFeed", {
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
  });

  if (shouldVerifyContracts(chainId)) {
    const contractPath = `contracts/PriceFeed.sol:PriceFeed`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
      isUpgradeable: true,
    });
  }
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  if (isLocalhostNetwork(chainId)) {
    await deployLocalhostNetwork(deployer, deploy);
  } else if (isLayer2Network(chainId)) {
    await deployAndVerifyOnLayer2(deployer, deploy, chainId);
  } else if (isSupportedNetwork(chainId)) {
    await deployAndVerifyOnLayer1(deployer, deploy, chainId);
  }
};

export default func;
func.id = "deploy_priceFeed";
func.tags = ["PriceFeed"];
