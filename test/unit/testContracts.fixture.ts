import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther } from "ethers";
import { deployments, ethers } from "hardhat";

import { LOCAL_NETWORK_COLLATERALS } from "../../config/collaterals";
import type {
  ERC20Test,
  ERC20Test__factory,
  FlashLoanTester,
  FlashLoanTester__factory,
  MockAggregator,
  MockAggregator__factory,
  MockApi3Proxy,
  MockApi3Proxy__factory,
  MockPythPriceFeed,
  MockPythPriceFeed__factory,
  MockUniswapRouterV3,
  MockUniswapRouterV3__factory,
  TrenMathTester,
  TrenMathTester__factory,
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
      collateral.gasCompensation
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

  const erc20_with_6_decimals: ERC20Test = (await ERC20Factory.connect(deployer).deploy(
    ...args
  )) as ERC20Test;
  await erc20_with_6_decimals.waitForDeployment();
  await erc20_with_6_decimals.setDecimals(6);
  const FlashLoanTesterFactory: FlashLoanTester__factory = (await ethers.getContractFactory(
    "FlashLoanTester"
  )) as FlashLoanTester__factory;

  type FlashLoanTesterDeployArgs = Parameters<typeof FlashLoanTesterFactory.deploy>;
  const flashLoanTesterArgs: FlashLoanTesterDeployArgs = [];

  const flashLoanTester: FlashLoanTester = (await FlashLoanTesterFactory.connect(deployer).deploy(
    ...flashLoanTesterArgs
  )) as FlashLoanTester;
  await flashLoanTester.waitForDeployment();

  const MockRouterFactory: MockUniswapRouterV3__factory = (await ethers.getContractFactory(
    "MockUniswapRouterV3"
  )) as MockUniswapRouterV3__factory;

  type MockRouterDeployArgs = Parameters<typeof MockRouterFactory.deploy>;
  const mockRouterArgs: MockRouterDeployArgs = [];

  const mockRouter: MockUniswapRouterV3 = (await MockRouterFactory.connect(deployer).deploy(
    ...mockRouterArgs
  )) as MockUniswapRouterV3;
  await mockRouter.waitForDeployment();

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

  const MockPythPriceFeedFactory: MockPythPriceFeed__factory = (await ethers.getContractFactory(
    "MockPythPriceFeed"
  )) as MockPythPriceFeed__factory;

  type PythDeployArgs = Parameters<typeof MockPythPriceFeedFactory.deploy>;
  const pythArgs: PythDeployArgs = [];

  const mockPyth: MockPythPriceFeed = (await MockPythPriceFeedFactory.connect(deployer).deploy(
    ...pythArgs
  )) as MockPythPriceFeed;
  await mockPyth.waitForDeployment();

  const now = Math.floor(Date.now() / 1000);

  const initialPythPriceFeedData = await mockPyth.createPriceFeedUpdateData(
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    1,
    224843971,
    -8,
    1,
    224843971,
    now,
    0
  );
  await mockPyth.updatePriceFeeds([initialPythPriceFeedData]);

  const TrenMathTesterFactory: TrenMathTester__factory = (await ethers.getContractFactory(
    "TrenMathTester"
  )) as TrenMathTester__factory;

  type TrenMathTesterDeployArgs = Parameters<typeof TrenMathTesterFactory.deploy>;
  const trenMathTesterArgs: TrenMathTesterDeployArgs = [];

  const trenMathTester: TrenMathTester = (await TrenMathTesterFactory.connect(deployer).deploy(
    ...trenMathTesterArgs
  )) as TrenMathTester;
  await trenMathTester.waitForDeployment();

  const priceFeedTestnet = await ethers.getContractAt(
    "PriceFeedTestnet",
    deploymentSummary.PriceFeedTestnet.address
  );

  return {
    testContracts: {
      erc20,
      erc20_with_6_decimals,
      mockAggregator,
      mockApi3,
      mockPyth,
      priceFeedTestnet,
      flashLoanTester,
      mockRouter,
      trenMathTester,
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
