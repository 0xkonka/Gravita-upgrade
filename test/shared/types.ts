import type {
  HardhatEthersSigner,
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike, BaseContract, ContractTransactionResponse } from "ethers";

import { Collateral } from "../../config/collaterals";
import type {
  AdminContract,
  BorrowerOperations,
  CollSurplusPool,
  DebtToken,
  ERC20,
  FeeCollector,
  FlashLoan,
  IPriceFeed,
  PriceFeed,
  PriceFeedL2,
  PriceFeedTestnet,
  SortedTrenBoxes,
  StabilityPool,
  Timelock,
  TrenBoxManager,
  TrenBoxManagerOperations,
  TrenBoxStorage,
} from "../../types";
import {
  ERC20Test,
  FlashLoanTester,
  MockAggregator,
  MockApi3Proxy,
  MockUniswapRouterV3,
  TrenMathTester,
} from "../../types/contracts/TestContracts";

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
  adminContract: AdminContract;
  borrowerOperations: BorrowerOperations;
  collSurplusPool: CollSurplusPool;
  debtToken: DebtToken;
  feeCollector: FeeCollector;
  flashLoan: FlashLoan;
  priceFeed: IPriceFeed;
  sortedTrenBoxes: SortedTrenBoxes;
  stabilityPool: StabilityPool;
  timelock: Timelock;
  trenBoxManager: TrenBoxManager;
  trenBoxManagerOperations: TrenBoxManagerOperations;
  trenBoxStorage: TrenBoxStorage;
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
      action: "addCollateral";
      args: AddCollateralArgs;
    }
  | {
      action: "withdrawCollateral";
      args: WithdrawCollateralArgs;
    }
  | {
      action: "takeDebt";
      args: TakeDebtArgs;
    }
  | {
      action: "repayDebt";
      args: RepayDebtArgs;
    }
  | {
      action: "provideToStabilityPool";
      args: ProvideToStabilityPoolArgs;
    }
  | {
      action: "withdrawFromStabilityPool";
      args: WithdrawFromStabilityPoolArgs;
    }
  | {
      action: "redeemCollateral";
      args: RedeemCollateralArgs;
    }
  | {
      action: "liquidate";
      args: LiquidateArgs;
    }
  | {
      action: "liquidateTrenBoxes";
      args: LiquidateTrenBoxesArgs;
    }
  | {
      action: "batchLiquidateTrenBoxes";
      args: BatchLiquidateTrenBoxesArgs;
    }
  | {
      action: "closeTrenBox";
      args: CloseTrenBoxArgs;
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
  overrides?: Partial<RedeployedContracts>;
};

export type SetupProtocolForTestsResult = void;

export type SetUsersArgs = HardhatEthersSigner[];

export type AddCollateralArgs = {
  from?: HardhatEthersSigner;
  collateral: ERC20;
  amount: bigint;
  autoApprove?: boolean;
  upperHint?: AddressLike;
  lowerHint?: AddressLike;
  overrideBorrowerOperations?: BorrowerOperations;
};
export type AddCollateralResult = ContractTransactionResponse;

export type WithdrawCollateralArgs = {
  from?: HardhatEthersSigner;
  collateral: ERC20;
  amount: bigint;
  upperHint?: AddressLike;
  lowerHint?: AddressLike;
  overrideBorrowerOperations?: BorrowerOperations;
};
export type WithdrawCollateralResult = ContractTransactionResponse;

export type TakeDebtArgs = {
  from?: HardhatEthersSigner;
  collateral: ERC20;
  debtAmount: bigint;
  upperHint?: AddressLike;
  lowerHint?: AddressLike;
  overrideBorrowerOperations?: BorrowerOperations;
};
export type TakeDebtResult = ContractTransactionResponse;

export type RepayDebtArgs = {
  from?: HardhatEthersSigner;
  collateral: ERC20;
  debtAmount: bigint;
  upperHint?: AddressLike;
  lowerHint?: AddressLike;
  autoApprove?: boolean;
  overrideBorrowerOperations?: BorrowerOperations;
  overrideDebtToken?: DebtToken;
};
export type RepayDebtResult = ContractTransactionResponse;

export type ProvideToStabilityPoolArgs = {
  from?: HardhatEthersSigner;
  amount: bigint;
  assets: (ERC20 | AddressLike)[];
  overrideStabilityPool?: StabilityPool;
};
export type ProvideToStabilityPoolResult = ContractTransactionResponse;

export type WithdrawFromStabilityPoolArgs = {
  from?: HardhatEthersSigner;
  amount: bigint;
  assets: (ERC20 | AddressLike)[];
  overrideStabilityPool?: StabilityPool;
};
export type WithdrawFromStabilityPoolResult = ContractTransactionResponse;

export type LiquidateArgs = {
  from?: HardhatEthersSigner;
  asset: ERC20 | AddressLike;
  borrower: HardhatEthersSigner | AddressLike;
  overrideTrenBoxManagerOperations?: TrenBoxManagerOperations;
};
export type LiquidateResult = ContractTransactionResponse;

export type BatchLiquidateTrenBoxesArgs = {
  from?: HardhatEthersSigner;
  asset: ERC20 | AddressLike;
  trenBoxes: AddressLike[];
  overrideTrenBoxManagerOperations?: TrenBoxManagerOperations;
};
export type BatchLiquidateTrenBoxesResult = ContractTransactionResponse;

export type LiquidateTrenBoxesArgs = {
  from?: HardhatEthersSigner;
  asset: ERC20 | AddressLike;
  numberOfTrenBoxes: bigint;
  overrideTrenBoxManagerOperations?: TrenBoxManagerOperations;
};
export type LiquidateTrenBoxesResult = ContractTransactionResponse;

export type RedeemCollateralArgs = {
  from?: HardhatEthersSigner;
  asset: ERC20 | AddressLike;
  debtTokenAmount: bigint;
  numberOfTrials: bigint;
  randomSeed: bigint;

  maxFeePercentage?: bigint;
  price?: bigint;
  maxIterations?: bigint;

  overridePriceFeed?: PriceFeed;
  overrideTrenBoxManagerOperations?: TrenBoxManagerOperations;
  overrideSortedTrenBoxes?: SortedTrenBoxes;
};
export type RedeemCollateralResult = ContractTransactionResponse;

export type CloseTrenBoxArgs = {
  from?: HardhatEthersSigner;
  asset: ERC20 | AddressLike;
  overrideBorrowerOperations?: BorrowerOperations;
};

export type CloseTrenBoxResult = ContractTransactionResponse;

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
  addCollateral(args: AddCollateralArgs): Promise<AddCollateralResult>;
  withdrawCollateral(args: WithdrawCollateralArgs): Promise<WithdrawCollateralResult>;
  takeDebt(args: TakeDebtArgs): Promise<TakeDebtResult>;
  repayDebt(args: RepayDebtArgs): Promise<RepayDebtResult>;
  provideToStabilityPool(args: ProvideToStabilityPoolArgs): Promise<ProvideToStabilityPoolResult>;
  withdrawFromStabilityPool(
    args: WithdrawFromStabilityPoolArgs
  ): Promise<WithdrawFromStabilityPoolResult>;
  liquidate: (args: LiquidateArgs) => Promise<LiquidateResult>;
  liquidateTrenBoxes: (args: LiquidateTrenBoxesArgs) => Promise<LiquidateTrenBoxesResult>;
  batchLiquidateTrenBoxes: (
    args: BatchLiquidateTrenBoxesArgs
  ) => Promise<BatchLiquidateTrenBoxesResult>;
  redeemCollateral: (args: RedeemCollateralArgs) => Promise<RedeemCollateralResult>;
  closeTrenBox: (args: CloseTrenBoxArgs) => Promise<CloseTrenBoxResult>;
}

export interface TestContracts {
  erc20: ERC20Test;
  erc20_with_6_decimals: ERC20Test;
  mockAggregator: MockAggregator;
  mockApi3: MockApi3Proxy;
  priceFeedTestnet: PriceFeedTestnet;
  flashLoanTester: FlashLoanTester;
  mockRouter: MockUniswapRouterV3;
  trenMathTester: TrenMathTester;
}

export enum TrenBoxStatus {
  nonExistent = 0,
  active = 1,
  closedByOwner = 2,
  closedByLiquidation = 3,
  closedByRedemption = 4,
}

export enum BorrowerOperationType {
  openTrenBox = 0,
  closeTrenBox = 1,
  adjustTrenBox = 2,
}
