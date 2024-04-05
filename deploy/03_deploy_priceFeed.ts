import type { AddressLike } from "ethers";
import type { DeployFunction, DeployResult, DeploymentsExtension } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { isLayer2Network, isLocalhostNetwork, isSupportedNetwork } from "../utils/networks";
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
  deploy: DeploymentsExtension["deploy"]
): Promise<void> {
  const initialOwner = deployer;

  type ConstructorParams = [AddressLike];
  const args: ConstructorParams = [initialOwner];

  await preDeploy(deployer, "PriceFeedL2");
  const deployResult: DeployResult = await deploy("PriceFeedL2", {
    from: deployer,
    args: args,
    log: true,
    proxy: true,
  });

  const contractPath = `contracts/Pricing/PriceFeedL2.sol:PriceFeedL2`;
  await verifyContract({
    contractPath: contractPath,
    contractAddress: deployResult.address,
    args: deployResult.args || [],
  });
}

async function deployAndVerifyOnLayer1(
  deployer: string,
  deploy: DeploymentsExtension["deploy"]
): Promise<void> {
  await preDeploy(deployer, "PriceFeed");

  const deployResult: DeployResult = await deploy("PriceFeed", {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
    autoMine: true,
  });

  const contractPath = `contracts/PriceFeed.sol:PriceFeed`;
  await verifyContract({
    contractPath: contractPath,
    contractAddress: deployResult.address,
    args: deployResult.args || [],
  });
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  if (isLocalhostNetwork(chainId)) {
    await deployLocalhostNetwork(deployer, deploy);
  } else if (isLayer2Network(chainId)) {
    await deployAndVerifyOnLayer2(deployer, deploy);
  } else if (isSupportedNetwork(chainId)) {
    await deployAndVerifyOnLayer1(deployer, deploy);
  }
};

export default func;
func.id = "deploy_priceFeed";
func.tags = ["PriceFeed"];
