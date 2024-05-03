import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, getNamedAccounts, getUnnamedAccounts, network } from "hardhat";

import type { Contracts, RedeployedContracts, Signers, TestUtils } from "../shared/types";
import { setupUtils } from "../utils";
import { testAdminContract } from "./adminContract/AdminContract";
import { testBorrowerOperations } from "./borrowerOperations/BorrowerOperations";
import { testCollSurplusPool } from "./collSurplusPool/CollSurplusPool";
import { testDebtToken } from "./debtToken/DebtToken";
import { loadDeploymentFixture } from "./deployment.fixture";
import { testFeeCollector } from "./feeCollector/FeeCollector";
import { testFlashLoan } from "./flashLoan/FlashLoan";
import { testPriceFeed } from "./priceFeed/PriceFeed";
import { testSortedTrenBoxes } from "./sortedTrenBoxes/SortedTrenBoxes";
import { testStabilityPool } from "./stabilityPool/StabilityPool";
import { loadTestFixture } from "./testContracts.fixture";
import { testTimelock } from "./timelock/Timelock";
import { testTrenBoxManager } from "./trenBoxManager/TrenBoxManager";
import { testTrenBoxManagerOperations } from "./trenBoxManagerOperations/TrenBoxManagerOperations";
import { testTrenBoxStorage } from "./trenBoxStorage/TrenBoxStorage";
import { testTrenMathTester } from "./trenMathTester/TrenMathTester";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;
    this.redeployedContracts = {} as RedeployedContracts;
    this.utils = {
      revertToInitialSnapshot: async () => {
        await network.provider.send("evm_revert", [this.initialSnapshotId]);
      },
    } as TestUtils;

    const { deployer, treasury } = await getNamedAccounts();
    const unnamedAccounts = await getUnnamedAccounts();

    this.signers.deployer = await ethers.getSigner(deployer);
    this.signers.treasury = await ethers.getSigner(treasury);
    this.signers.accounts = await Promise.all(
      unnamedAccounts.map((address) => ethers.getSigner(address))
    );
    this.users = [];

    this.loadFixture = loadFixture;
    this.contracts = await this.loadFixture(loadDeploymentFixture);
    const { testContracts, collaterals } = await this.loadFixture(loadTestFixture);
    this.collaterals = collaterals;
    this.testContracts = testContracts;

    this.initialSnapshotId = await network.provider.send("evm_snapshot", []);
    this.snapshotId = this.initialSnapshotId;
    this.utils = setupUtils(this);
  });

  beforeEach(async function () {
    this.snapshotId = await network.provider.send("evm_snapshot");
    this.users = [];
  });

  afterEach(async function () {
    await network.provider.send("evm_revert", [this.snapshotId]);
  });

  after(async function () {
    await this.utils.revertToInitialSnapshot();
  });

  testAdminContract();
  testBorrowerOperations();
  testDebtToken();
  testPriceFeed();
  testSortedTrenBoxes();
  testTrenBoxManager();
  testCollSurplusPool();
  testFeeCollector();
  testStabilityPool();
  testTrenBoxManagerOperations();
  testFlashLoan();
  testTimelock();
  testTrenMathTester();
  testTrenBoxStorage();
});
