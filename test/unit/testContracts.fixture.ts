import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther } from "ethers";
import { deployments, ethers } from "hardhat";

import { LOCAL_NETWORK_COLLATERALS } from "../../config/collaterals";
import type {
  ERC20Test,
  ERC20Test__factory,
  MockAggregator,
  MockAggregator__factory,
  MockApi3Proxy,
  MockApi3Proxy__factory,
} from "../../types";
import { Collaterals, TestContracts } from "../shared/types";

const COLLATERALS_TO_ADD_AS_INACTIVE = [
  {
    name: "DAI",
    address: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
    decimals: 18,
    borrowingFee: parseEther("0.01"),
    oracleAddress: "0xE8BAde28E08B469B4EeeC35b9E48B2Ce49FB3FC9",
    oracleTimeoutMinutes: 1440,
    oracleIsEthIndexed: false,
    MCR: parseEther("1.25"),
    CCR: parseEther("1.5"),
    minNetDebt: parseEther("1800"),
    gasCompensation: parseEther("300"),
    mintCap: parseEther("1500000"),
  },
];

export async function loadTestFixture(): Promise<{
  testContracts: TestContracts;
  collaterals: Collaterals;
}> {
  const deploymentSummary = await deployments.fixture();
  const signers = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const adminContract = await ethers.getContractAt(
    "AdminContract",
    deploymentSummary.AdminContract.address
  );

  for (const collateral of COLLATERALS_TO_ADD_AS_INACTIVE) {
    const addCollateralTx = await adminContract.addNewCollateral(
      collateral.address,
      collateral.gasCompensation,
      collateral.decimals
    );

    await addCollateralTx.wait();
  }

  const ERC20Factory: ERC20Test__factory = (await ethers.getContractFactory(
    "ERC20Test"
  )) as ERC20Test__factory;

  type DeployArgs = Parameters<typeof ERC20Factory.deploy>;
  const args: DeployArgs = [];

  const erc20: ERC20Test = (await ERC20Factory.connect(deployer).deploy(...args)) as ERC20Test;
  await erc20.waitForDeployment();
  await erc20.setDecimals(6);

  const usdc: ERC20Test = (await ERC20Factory.connect(deployer).deploy(...args)) as ERC20Test;
  await usdc.waitForDeployment();
  await usdc.setDecimals(6);

  const MockAggregatorFactory: MockAggregator__factory = (await ethers.getContractFactory(
    "MockAggregator"
  )) as MockAggregator__factory;

  type AggregatorDeployArgs = Parameters<typeof MockAggregatorFactory.deploy>;
  const aggregatorArgs: AggregatorDeployArgs = [];

  const mockAggregator: MockAggregator = (await MockAggregatorFactory.connect(deployer).deploy(
    ...aggregatorArgs
  )) as MockAggregator;
  await mockAggregator.waitForDeployment();

  const MockApi3Factory: MockApi3Proxy__factory = (await ethers.getContractFactory(
    "MockApi3Proxy"
  )) as MockApi3Proxy__factory;

  type Api3DeployArgs = Parameters<typeof MockApi3Factory.deploy>;
  const api3Args: Api3DeployArgs = [];

  const mockApi3: MockApi3Proxy = (await MockApi3Factory.connect(deployer).deploy(
    ...api3Args
  )) as MockApi3Proxy;
  await mockApi3.waitForDeployment();

  const priceFeedTestnet = await ethers.getContractAt(
    "PriceFeedTestnet",
    deploymentSummary.PriceFeedTestnet.address
  );

  return {
    testContracts: {
      erc20,
      usdc,
      mockAggregator,
      mockApi3,
      priceFeedTestnet,
    },
    collaterals: {
      active: {
        wETH: LOCAL_NETWORK_COLLATERALS[0],
      },
      inactive: {
        dai: COLLATERALS_TO_ADD_AS_INACTIVE[0],
      },
      notAdded: {
        testCollateral: {
          ...LOCAL_NETWORK_COLLATERALS[0],
          address: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
        },
      },
    },
  };
}
