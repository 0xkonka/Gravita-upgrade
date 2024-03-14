import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { Collateral } from "../../config/collaterals";
import type {
  AdminContract,
  BorrowerOperations,
  DebtToken,
  Lock,
  StabilityPool,
  TrenBoxManager,
} from "../../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    revertToInitialSnapshot: () => Promise<void>;
    initialSnapshotId: string;
    snapshotId: string;

    collaterals: Collaterals;
  }
}

export interface Contracts {
  lock: Lock;
  adminContract: AdminContract;
  borrowerOperations: BorrowerOperations;
  debtToken: DebtToken;
  stabilityPool: StabilityPool;
  trenBoxManager: TrenBoxManager;
}

export interface Signers {
  deployer: SignerWithAddress;
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
