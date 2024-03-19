import type {
  HardhatEthersSigner,
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike, BaseContract } from "ethers";

import { Collateral } from "../../config/collaterals";
import type {
  ActivePool,
  AdminContract,
  BorrowerOperations,
  CollSurplusPool,
  DebtToken,
  DefaultPool,
  FeeCollector,
  GasPool,
  IPriceFeed,
  Lock,
  SortedTrenBoxes,
  StabilityPool,
  Timelock,
  TrenBoxManager,
  TrenBoxManagerOperations,
} from "../../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    contracts: Contracts;
    signers: Signers;
    initialSnapshotId: string;
    snapshotId: string;
    collaterals: Collaterals;

    utils: TestUtils;
    redeployedContracts: Contracts;
  }
}

export interface Contracts {
  lock: Lock;
  activePool: ActivePool;
  adminContract: AdminContract;
  borrowerOperations: BorrowerOperations;
  collSurplusPool: CollSurplusPool;
  debtToken: DebtToken;
  defaultPool: DefaultPool;
  feeCollector: FeeCollector;
  gasPool: GasPool;
  priceFeed: IPriceFeed;
  sortedTrenBoxes: SortedTrenBoxes;
  stabilityPool: StabilityPool;
  timelock: Timelock;
  trenBoxManager: TrenBoxManager;
  trenBoxManagerOperations: TrenBoxManagerOperations;
}

export interface Signers {
  deployer: SignerWithAddress;
  treasury: SignerWithAddress;
  accounts: SignerWithAddress[];
}

export interface Collaterals {
  active: {
    wETH: Collateral;
  };
  inactive: {
    dai: Collateral;
  };
  notAdded: {
    testCollateral: Collateral;
  };
}

export type GetAddressesForSetAddressesOverrides = Partial<
  Record<keyof Contracts | "treasury", BaseContract | HardhatEthersSigner>
>;

export type GetAddressesForSetAddressesResult = AddressLike[];

export interface TestUtils {
  revertToInitialSnapshot: () => Promise<void>;
  getAddressesForSetAddresses: (
    overrides?: GetAddressesForSetAddressesOverrides
  ) => Promise<GetAddressesForSetAddressesResult>;
}
