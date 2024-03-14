import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, getNamedAccounts, getUnnamedAccounts, network } from "hardhat";

import type { Contracts, Signers } from "../shared/types";
import { testAdminContract } from "./adminContract/AdminContract";
import { loadCollateralsFixture } from "./collaterals.fixture";
import { testDebtToken } from "./debtToken/DebtToken";
import { loadDeploymentFixture } from "./deployment.fixture";
import { testLock } from "./lock/Lock";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;

    const { deployer } = await getNamedAccounts();
    const unnamedAccounts = await getUnnamedAccounts();

    this.signers.deployer = await ethers.getSigner(deployer);
    this.signers.accounts = await Promise.all(
      unnamedAccounts.map((address) => ethers.getSigner(address))
    );

    this.loadFixture = loadFixture;
    this.contracts = await this.loadFixture(loadDeploymentFixture);
    this.collaterals = await this.loadFixture(loadCollateralsFixture);

    this.initialSnapshotId = await network.provider.send("evm_snapshot", []);
    this.snapshotId = this.initialSnapshotId;

    this.revertToInitialSnapshot = async () => {
      await network.provider.send("evm_revert", [this.initialSnapshotId]);
    };
  });

  beforeEach(async function () {
    this.snapshotId = await network.provider.send("evm_snapshot");
  });

  afterEach(async function () {
    await network.provider.send("evm_revert", [this.snapshotId]);
  });

  after(async function () {
    await this.revertToInitialSnapshot();
  });

  testAdminContract();
  testDebtToken();
  testLock();
});
