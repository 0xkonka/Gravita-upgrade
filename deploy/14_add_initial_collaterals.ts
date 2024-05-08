/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import type { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { COLLATERALS, Collateral, LOCAL_NETWORK_COLLATERALS } from "../config/collaterals";
import { PriceFeed, PriceFeedL2 } from "../types";
import { isLayer2Network, isLocalhostNetwork } from "../utils/networks";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getChainId, network } = hre;

  const chainId = await getChainId();

  if (isLocalhostNetwork(chainId)) {
    console.log(`Adding collaterals on local network`);
    for (const collateral of LOCAL_NETWORK_COLLATERALS) {
      await addPriceFeedOracle(collateral, hre);
      await addCollateral(collateral, hre);
    }
  } else {
    console.log(`Adding collaterals on ${network.name} network`);
    const collaterals = COLLATERALS[network.name as keyof typeof COLLATERALS] ?? [];
    for (const collateral of collaterals) {
      await addPriceFeedOracle(collateral, hre);
      await addCollateral(collateral, hre);
    }
  }
};

export default func;
func.id = "add_initial_collaterals";
func.tags = [];

async function addCollateral(collateral: Collateral, hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  const adminContractDeployment = await deployments.get("AdminContract");
  const adminContract = await ethers.getContractAt(
    "AdminContract",
    adminContractDeployment.address
  );

  const collateralMcr = await adminContract.getMcr(collateral.address);
  const collateralExist = collateralMcr > 0n;

  if (collateralExist) {
    console.log(`Collateral ${collateral.name} already exists`);
  } else {
    const addNewCollateralTx = await adminContract.addNewCollateral(
      collateral.address,
      collateral.gasCompensation
    );

    await addNewCollateralTx.wait();

    console.log(`Collateral ${chalk.cyan(collateral.name)} added`);
  }

  const isActive = await adminContract.getIsActive(collateral.address);
  if (isActive) {
    console.log(`Collateral ${collateral.name} is already active`);
  } else {
    const defaultPercentDivisor = await adminContract.PERCENT_DIVISOR_DEFAULT();
    const defaultRedemptionFeeFloor = await adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

    const setCollateralParametersTx = await adminContract.setCollateralParameters(
      collateral.address,
      collateral.borrowingFee,
      collateral.CCR,
      collateral.MCR,
      collateral.minNetDebt,
      collateral.mintCap,
      defaultPercentDivisor,
      defaultRedemptionFeeFloor
    );

    await setCollateralParametersTx.wait();
    console.log(`Collateral ${chalk.cyan(collateral.name)} parameters set`);
  }
}

async function addPriceFeedOracle(collateral: Collateral, hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getChainId } = hre;
  const chainId = await getChainId();

  let priceFeed: PriceFeed | PriceFeedL2;

  if (isLocalhostNetwork(chainId)) {
    console.log("⛓️ Skipping adding PriceFeed on a local network");
    return;
  } else if (isLayer2Network(chainId)) {
    const priceFeedL2Deployment = await deployments.get("PriceFeedL2");
    priceFeed = await ethers.getContractAt("PriceFeedL2", priceFeedL2Deployment.address);
  } else {
    const priceFeedDeployment = await deployments.get("PriceFeed");
    priceFeed = await ethers.getContractAt("PriceFeed", priceFeedDeployment.address);
  }

  const oracleRecord = await priceFeed.oracles(collateral.address);

  if (oracleRecord.decimals === 0n) {
    const oracleProviderType = 0;
    const isFallback = false;
    const setOracleTx = await priceFeed.setOracle(
      collateral.address,
      collateral.oracleAddress,
      oracleProviderType,
      collateral.oracleTimeoutMinutes,
      collateral.oracleIsEthIndexed,
      isFallback
    );

    await setOracleTx.wait();
  }
}
