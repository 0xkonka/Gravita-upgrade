import type {
  HardhatEthersSigner,
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike, BaseContract, BigNumberish, ContractTransactionResponse } from "ethers";

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
  PriceFeedTestnet,
  SortedTrenBoxes,
  StabilityPool,
  Timelock,
  TrenBoxManager,
  TrenBoxManagerOperations,
} from "../../types";
import { ERC20Test } from "../../types/contracts/TestContracts/TestErc20.sol";

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
    testContracts: TestContracts;
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

export type OpenTrenBoxArgs = {
  asset: AddressLike;
  assetAmount: bigint;
  upperHint?: string;
  lowerHint?: string;
  extraDebtTokenAmount?: bigint;
  overrideAdminContract?: AdminContract;
  overrideBorrowerOperations?: BorrowerOperations;
  overrideTrenBoxManager?: TrenBoxManager;
  from?: SignerWithAddress;
};

export type OpenTrenBoxResult = {
  openTrenBoxTx: Promise<ContractTransactionResponse>;
  debtTokenAmount: bigint;
  netDebt: bigint;
  totalDebt: bigint;
  collateralAmount: bigint;
};

export type GetNetBorrowingAmountArgs = {
  asset: AddressLike;
  debtWithFees: bigint;
  overrideTrenBoxManager?: TrenBoxManager;
};

export type GetCompositeDebtArgs = {
  asset: AddressLike;
  debtTokenAmount: bigint;
  overrideBorrowerOperations?: BorrowerOperations;
};

export type GetOpenTrenBoxTotalDebtArgs = GetCompositeDebtArgs & {
  overrideTrenBoxManager?: TrenBoxManager;
};

export type GetActualDebtFromCompositeDebtArgs = {
  asset: AddressLike;
  compositeDebt: bigint;
  overrideTrenBoxManager?: TrenBoxManager;
};

export interface TestUtils {
  revertToInitialSnapshot: () => Promise<void>;
  getAddressesForSetAddresses: (
    overrides?: GetAddressesForSetAddressesOverrides
  ) => Promise<GetAddressesForSetAddressesResult>;
  openTrenBox: (args: OpenTrenBoxArgs) => Promise<OpenTrenBoxResult>;
  getNetBorrowingAmount(args: GetNetBorrowingAmountArgs): Promise<bigint>;
  getOpenTrenBoxTotalDebt(args: GetOpenTrenBoxTotalDebtArgs): Promise<bigint>;
  getCompositeDebt: (args: GetCompositeDebtArgs) => Promise<bigint>;
  getActualDebtFromCompositeDebt: (args: GetActualDebtFromCompositeDebtArgs) => Promise<bigint>;
}

export interface TestContracts {
  erc20: ERC20Test;
  priceFeedTestnet: PriceFeedTestnet;
}
