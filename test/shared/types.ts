import type {
  HardhatEthersSigner,
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike, BaseContract, ContractTransactionResponse } from "ethers";

import { Collateral } from "../../config/collaterals";
import type {
  ActivePool,
  AdminContract,
  BorrowerOperations,
  CollSurplusPool,
  DebtToken,
  DefaultPool,
  ERC20,
  FeeCollector,
  GasPool,
  IPriceFeed,
  Lock,
  PriceFeed,
  PriceFeedL2,
  PriceFeedTestnet,
  SortedTrenBoxes,
  StabilityPool,
  Timelock,
  TrenBoxManager,
  TrenBoxManagerOperations,
} from "../../types";
import { ERC20Test } from "../../types/contracts/TestContracts";

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
    redeployedContracts: RedeployedContracts;
    testContracts: TestContracts;
    users: HardhatEthersSigner[];
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

export interface RedeployedContracts extends Contracts {
  priceFeed: PriceFeed;
  priceFeedL2: PriceFeedL2;
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

export type ConnectRedeployedContractArgs = Partial<
  Record<keyof Contracts | "treasury", BaseContract | HardhatEthersSigner>
>;

export type SetupCollateralForTestsArgs = {
  collateral: ERC20Test;
  collateralOptions: {
    mints?: {
      to: AddressLike;
      amount: bigint;
    }[];
    approve?: {
      from: HardhatEthersSigner;
      spender: AddressLike;
      amount: bigint;
    }[];
    price: bigint;
    debtTokenGasCompensation?: bigint;
    setAsActive?: boolean;
    mintCap?: bigint;
    setCollateralParams?: {
      borrowingFee: bigint;
      criticalCollateralRate: bigint;
      minimumCollateralRatio: bigint;
      minNetDebt: bigint;
      mintCap: bigint;
      percentDivisor: bigint;
      redemptionFeeFloor: bigint;
    };
  };
  overrideAdminContract?: AdminContract;
  overridePriceFeed?: PriceFeedTestnet;
};

export type SetupProtocolCommands =
  | {
      action: "openTrenBox";
      args: OpenTrenBoxArgs;
    }
  | {
      action: "approve";
      args: {
        from: HardhatEthersSigner;
        spender: AddressLike;
        amount: bigint;
        asset: ERC20;
      };
    };

export type SetupProtocolForTestsArgs = {
  collaterals?: SetupCollateralForTestsArgs[];
  commands?: SetupProtocolCommands[];
  overrides?: RedeployedContracts;
};

export type SetupProtocolForTestsResult = void;

export type SetUsersArgs = HardhatEthersSigner[];

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
  setupCollateralForTests: (args: SetupCollateralForTestsArgs) => Promise<void>;
  connectRedeployedContracts: (args: ConnectRedeployedContractArgs) => Promise<void>;
  setupProtocolForTests: (args: SetupProtocolForTestsArgs) => Promise<SetupProtocolForTestsResult>;
  setUsers: (args: SetUsersArgs) => Promise<HardhatEthersSigner[]>;
}

export interface TestContracts {
  erc20: ERC20Test;
  priceFeedTestnet: PriceFeedTestnet;
}
