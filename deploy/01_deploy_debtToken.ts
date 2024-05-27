import type { AddressLike } from "ethers";
import type { DeployFunction, DeployResult } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { generateSalt } from "../utils/misc";
import { shouldVerifyContracts } from "../utils/networks";
import { verifyContract } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const initialOwner = deployer;

  type ConstructorParams = [AddressLike];
  const args: ConstructorParams = [initialOwner];

  await preDeploy(deployer, "DebtToken");
  const deployResult: DeployResult = await deploy("DebtToken", {
    from: deployer,
    deterministicDeployment: generateSalt("TRENtestnet"),
    args: args,
    log: true,
  });

  if (shouldVerifyContracts(chainId)) {
    const contractPath = `contracts/DebtToken.sol:DebtToken`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
    });
  }
};

export default func;
func.id = "deploy_debtToken";
func.tags = ["DebtToken"];
