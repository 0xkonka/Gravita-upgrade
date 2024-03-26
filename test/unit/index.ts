import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, getNamedAccounts, getUnnamedAccounts, network } from "hardhat";

import type { Contracts, Signers } from "../shared/types";
import { setupUtils } from "../utils";
import { testActivePool } from "./activePool/ActivePool";
import { testAdminContract } from "./adminContract/AdminContract";
import { testBorrowerOperations } from "./borrowerOperations/BorrowerOperations";
import { testCollSurplusPool } from "./collSurplusPool/CollSurplusPool";
import { testDebtToken } from "./debtToken/DebtToken";
import { testDefaultPool } from "./defaultPool/DefaultPool";
import { testFeeCollector } from "./feeCollector/FeeCollector";
import { loadDeploymentFixture } from "./deployment.fixture";
import { testLock } from "./lock/Lock";
import { loadTestFixture } from "./testContracts.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;
    this.redeployedContracts = {} as Contracts;

    const { deployer, treasury } = await getNamedAccounts();
    const unnamedAccounts = await getUnnamedAccounts();

    this.signers.deployer = await ethers.getSigner(deployer);
    this.signers.treasury = await ethers.getSigner(treasury);
    this.signers.accounts = await Promise.all(
      unnamedAccounts.map((address) => ethers.getSigner(address))
    );

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
  });

  afterEach(async function () {
    await network.provider.send("evm_revert", [this.snapshotId]);
  });

  after(async function () {
    await this.utils.revertToInitialSnapshot();
  });

  testActivePool();
  testAdminContract();
  testBorrowerOperations();
  testDebtToken();
  testLock();
  testCollSurplusPool();
  testDefaultPool();
  testFeeCollector();
});
