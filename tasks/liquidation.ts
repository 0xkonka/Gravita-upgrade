import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseEther, ZeroHash } from "ethers";

import { parseFile } from "../utils/files";
import { Collateral, ORACLE_PROVIDER_TYPE } from "../config/collaterals";
import { isLocalhostNetwork } from "../utils/networks";
import { PriceFeed } from "../types";

task("liquidation", "Starts liquidation on a given collateral")
    .addParam('configPath', 'The file path with config for a new collateral', '', types.string)
    .addOptionalParam('name', 'The name of collateral asset', '', types.string)
    .addOptionalParam('address', 'The address of collateral asset', '', types.string)
    .addOptionalParam('decimals', 'The decimals of collateral asset', 18, types.int)
    .addOptionalParam('borrowingFee', 'The one-time borrowing fee', '', types.string)
    .addOptionalParam('oracleAddress', 'The address of price oracle', '', types.string)
    .addOptionalParam('oracleProviderType', 'The type of oracle provider', 0, types.int) // Default 0: Chainlink
    .addOptionalParam('oracleTimeoutMinutes', 'The maximum period that lasts a stale price', 3600, types.int)
    .addOptionalParam('oracleIsEthIndexed', 'The flag to show whether to fetch price based on ETH', false, types.boolean)
    .addOptionalParam('isFallback', 'The fallback oracle or not', false, types.boolean)
    .addOptionalParam('oracleAdditionalData', 'The additional data required by the oracle provider', '', types.string)
    .addOptionalParam('mcr', 'The minimum collateral ratio', '', types.string)
    .addOptionalParam('ccr', 'The critical collateral ratio', '', types.string)
    .addOptionalParam('minNetDebt', 'The minimum amount of debtToken', '', types.string)
    .addOptionalParam('gasCompensation', 'The gas compensation', "200", types.string)
    .addOptionalParam('mintCap', 'The total mint cap', '', types.string)
    .setAction(async ( taskArgs, hre ) => {
        let collateralParams: Collateral;
        if (await parseFile(taskArgs.configPath)) {
            collateralParams = await parseFile(taskArgs.configPath);
        } else if (taskArgs.address) {
            collateralParams = {
                name: taskArgs.name,
                address: taskArgs.address,
                decimals: taskArgs.decimals,
                borrowingFee: parseEther(taskArgs.borrowingFee),
                oracleAddress: taskArgs.oracleAddress,
                oracleProviderType: taskArgs.oracleProviderType,
                oracleTimeoutMinutes: taskArgs.oracleTimeoutMinutes,
                oracleIsEthIndexed: taskArgs.oracleIsEthIndexed,
                MCR: parseEther(taskArgs.mcr),
                CCR: parseEther(taskArgs.ccr),
                minNetDebt: parseEther(taskArgs.minNetDebt),
                gasCompensation: parseEther(taskArgs.gasCompensation),
                mintCap: parseEther(taskArgs.mintCap),
            }
        } else {
            console.log('Neither file path nor command args provided');
            return;
        }
        await addCollateral(collateralParams, hre);
        await addPriceFeedOracle(collateralParams, hre);
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
