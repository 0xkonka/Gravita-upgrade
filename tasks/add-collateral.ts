import { Wallet, ZeroHash } from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { COLLATERALS, Collateral, ORACLE_PROVIDER_TYPE } from "../config/collaterals";
import { PriceFeed } from "../types";
import { isLocalhostNetwork } from "../utils/networks";

task("add-collateral", "Add new collateral on a given network")
  .addOptionalParam("collateralname", "The name of collateral we want to add", "", types.string)
  .addOptionalParam("batch", "The batch number of collaterals we want to add", "", types.string)
  .setAction(async (args, hre) => {
    const { collateralname, batch } = args;

    if (!collateralname && !batch) {
      throw new Error("You must provide either a collateral name or a batch number.");
    }

    const networkName = hre.network.name as keyof typeof COLLATERALS;
    const collaterals = COLLATERALS[networkName] ?? [];

    let selectedCollaterals: Collateral[];

    if (collateralname) {
      selectedCollaterals = collaterals.filter((c: Collateral) => c.name === collateralname);
    } else if (batch) {
      selectedCollaterals = collaterals.filter((c: Collateral) => c.batch === parseInt(batch));
    } else {
      throw new Error("You must provide either a collateral name or a batch number.");
    }

    if (selectedCollaterals.length === 0) {
      throw new Error("No collateral(s) found for the provided parameter.");
    }

    for (const collateral of selectedCollaterals) {
      await addCollateral(collateral, hre);
      await addPriceFeedOracle(collateral, hre);
    }
  });

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
    console.log(`Collateral ${collateral.name} is added`);
  }
}

async function addPriceFeedOracle(collateral: Collateral, hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getChainId } = hre;
  const chainId = await getChainId();

  let priceFeed: PriceFeed;

  if (isLocalhostNetwork(chainId)) {
    console.log("Skipping adding PriceFeed on a local network");
    return;
  } else {
    const priceFeedDeployment = await deployments.get("PriceFeed");
    priceFeed = await ethers.getContractAt("PriceFeed", priceFeedDeployment.address);
  }

  const oracleRecord = await priceFeed.oracles(collateral.address);

  if (oracleRecord.decimals === 0n) {
    const setOracleTx = await priceFeed.setOracle(
      collateral.address,
      collateral.oracleAddress,
      collateral.oracleProviderType || ORACLE_PROVIDER_TYPE.Chainlink,
      collateral.oracleTimeoutMinutes,
      collateral.oracleIsEthIndexed,
      collateral.isFallback || false,
      collateral.oracleAdditionalData || ZeroHash
    );

    await setOracleTx.wait();
  }
}
