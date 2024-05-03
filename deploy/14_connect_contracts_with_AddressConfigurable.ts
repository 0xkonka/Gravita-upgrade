/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import type { DeployFunction, Deployment } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { isLayer2Network, isLocalhostNetwork, isSupportedNetwork } from "../utils/networks";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getChainId } = hre;
  const chainId = await getChainId();

  await callSetAddresses("AdminContract", hre);
  await callSetAddresses("BorrowerOperations", hre);
  await callSetAddresses("CollSurplusPool", hre);
  await callSetAddresses("FeeCollector", hre);
  await callSetAddresses("FlashLoan", hre);
  await callSetAddresses("SortedTrenBoxes", hre);
  await callSetAddresses("StabilityPool", hre);
  await callSetAddresses("TrenBoxManager", hre);
  await callSetAddresses("TrenBoxManagerOperations", hre);
  await callSetAddresses("TrenBoxStorage", hre);

  if (isLocalhostNetwork(chainId)) {
    console.log("⛓️ Skipping PriceFeedTestnet connection on a local network");
  } else if (isLayer2Network(chainId)) {
    await callSetAddresses("PriceFeedL2", hre);
  } else if (isSupportedNetwork(chainId)) {
    await callSetAddresses("PriceFeed", hre);
  }
};

export default func;
func.id = "connect_contracts_with_AddressesConfigurable";
func.tags = ["AddressesConfigurable"];

async function callSetAddresses(contractName: string, hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getChainId, getNamedAccounts } = hre;
  const { deployer, treasury } = await getNamedAccounts();

  const chainId = await getChainId();

  const contractToSetAddressesDeployment = await deployments.get(contractName);
  const contract = await ethers.getContractAt(
    contractName,
    contractToSetAddressesDeployment.address
  );

  const adminContractDeployment = await deployments.get("AdminContract");
  const borrowerOperationsDeployment = await deployments.get("BorrowerOperations");
  const collSurplusPoolDeployment = await deployments.get("CollSurplusPool");
  const debtTokenDeployment = await deployments.get("DebtToken");
  const feeCollectorDeployment = await deployments.get("FeeCollector");
  const flashLoanDeployment = await deployments.get("FlashLoan");

  let priceFeedDeployment: Deployment;
  if (isLocalhostNetwork(chainId)) {
    priceFeedDeployment = await deployments.get("PriceFeedTestnet");
  } else if (isLayer2Network(chainId)) {
    priceFeedDeployment = await deployments.get("PriceFeedL2");
  } else {
    priceFeedDeployment = await deployments.get("PriceFeed");
  }

  const sortedTrenBoxesDeployment = await deployments.get("SortedTrenBoxes");
  const stabilityPoolDeployment = await deployments.get("StabilityPool");
  const timelockAddress = await deployments.get("Timelock");

  const treasuryAddress = treasury;

  const trenBoxManagerDeployment = await deployments.get("TrenBoxManager");
  const trenBoxManagerOperationsDeployment = await deployments.get("TrenBoxManagerOperations");
  const trenBoxStorageDeployment = await deployments.get("TrenBoxStorage");

  await deployments.execute(
    contractName,
    {
      from: deployer,
      log: true,
      gasLimit: 3_000_000,
    },
    "setAddresses",
    [
      adminContractDeployment.address,
      borrowerOperationsDeployment.address,
      collSurplusPoolDeployment.address,
      debtTokenDeployment.address,
      feeCollectorDeployment.address,
      flashLoanDeployment.address,
      priceFeedDeployment.address,
      sortedTrenBoxesDeployment.address,
      stabilityPoolDeployment.address,
      timelockAddress.address,
      treasuryAddress,
      trenBoxManagerDeployment.address,
      trenBoxManagerOperationsDeployment.address,
      trenBoxStorageDeployment.address,
    ]
  );

  console.log(`⛓️ Connected: ${chalk.cyan(contractName)} to:`);
  console.log(`   - AdminContract: ${chalk.grey(await contract.adminContract())}`);
  console.log(`   - BorrowerOperations: ${chalk.grey(await contract.borrowerOperations())}`);
  console.log(`   - CollSurplusPool: ${chalk.grey(await contract.collSurplusPool())}`);
  console.log(`   - DebtToken: ${chalk.grey(await contract.debtToken())}`);
  console.log(`   - FeeCollector: ${chalk.grey(await contract.feeCollector())}`);
  console.log(`   - FlashLoan: ${chalk.grey(await contract.flashLoanAddress())}`);
  console.log(`   - PriceFeed: ${chalk.grey(await contract.priceFeed())}`);
  console.log(`   - SortedTrenBoxes: ${chalk.grey(await contract.sortedTrenBoxes())}`);
  console.log(`   - StabilityPool: ${chalk.grey(await contract.stabilityPool())}`);
  console.log(`   - Timelock: ${chalk.grey(await contract.timelockAddress())}`);
  console.log(`   - Treasury: ${chalk.grey(await contract.treasuryAddress())}`);
  console.log(`   - TrenBoxManager: ${chalk.grey(await contract.trenBoxManager())}`);
  console.log(
    `   - TrenBoxManagerOperations: ${chalk.grey(await contract.trenBoxManagerOperations())}`
  );
  console.log(`   - TrenBoxStorage: ${chalk.grey(await contract.trenBoxStorage())}`);
}
