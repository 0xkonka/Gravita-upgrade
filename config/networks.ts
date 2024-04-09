import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

const INFURA_KEY = process.env.INFURA_API_KEY;
if (typeof INFURA_KEY === "undefined") {
  console.log(`INFURA_API_KEY must be a defined environment variable`);
}

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;

const infuraUrl = (network: string): string => `https://${network}.infura.io/v3/${INFURA_KEY}`;
const alchemyUrl = (network: string): string =>
  `https://eth-${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;

/**
 * All supported network names
 * To use a network in your command use the value of each key
 *
 * e.g.
 *
 * $ yarn deploy:network mainnet
 *
 * $ npx hardhat run scripts/deploy.ts --network polygon-mainnet
 */
export enum NetworkName {
  // ETHEREUM
  MAINNET = "mainnet",
  GOERLI = "goerli",
  SEPOLIA = "sepolia",

  // BINANCE SMART CHAIN
  BSC = "bsc",
  BSC_TESTNET = "bsc-testnet",

  // POLYGON
  POLYGON_MAINNET = "polygon-mainnet",
  POLYGON_MUMBAI = "polygon-mumbai",

  // OPTIMISM
  OPTIMISM_MAINNET = "optimism-mainnet",
  OPTIMISM_GOERLI = "optimism-goerli",

  // ARBITRUM
  ARBITRUM_MAINNET = "arbitrum-mainnet",
  ARBITRUM_GOERLI = "arbitrum-goerli",

  // AVALANCHE
  AVALANCHE_MAINNET = "avalanche-mainnet",
  FUJI_AVALANCHE = "fuji-avalance",

  // FANTOM
  FANTOM_MAINNET = "fantom-mainnet",
  FANTOM_TESTNET = "fantom-testnet",
}

export interface Network {
  chainId: number;
  url: string;
  isTestnet?: boolean;
  isLayer2?: boolean;
}

export const NETWORKS: { readonly [key in NetworkName]: Network } = {
  // ETHEREUM
  [NetworkName.MAINNET]: {
    chainId: 1,
    url: alchemyUrl("mainnet"),
  },
  [NetworkName.GOERLI]: {
    chainId: 5,
    url: alchemyUrl("goerli"),
    isTestnet: true,
  },
  [NetworkName.SEPOLIA]: {
    chainId: 11155111,
    url: alchemyUrl("sepolia"),
    isTestnet: true,
  },

  // BINANCE SMART CHAIN
  [NetworkName.BSC]: {
    chainId: 56,
    url: "https://bsc-dataseed1.defibit.io/",
  },
  [NetworkName.BSC_TESTNET]: {
    chainId: 97,
    url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
    isTestnet: true,
  },

  // MATIC/POLYGON
  [NetworkName.POLYGON_MAINNET]: {
    chainId: 137,
    url: infuraUrl("polygon-mainnet"),
  },
  [NetworkName.POLYGON_MUMBAI]: {
    chainId: 80_001,
    url: infuraUrl("polygon-mumbai"),
    isTestnet: true,
  },

  // OPTIMISM
  [NetworkName.OPTIMISM_MAINNET]: {
    chainId: 10,
    url: infuraUrl("optimism-mainnet"),
    isLayer2: true,
  },
  [NetworkName.OPTIMISM_GOERLI]: {
    chainId: 420,
    url: infuraUrl("optimism-goerli"),
    isTestnet: true,
    isLayer2: true,
  },

  // ARBITRUM
  [NetworkName.ARBITRUM_MAINNET]: {
    chainId: 42_161,
    url: infuraUrl("arbitrum-mainnet"),
    isLayer2: true,
  },
  [NetworkName.ARBITRUM_GOERLI]: {
    chainId: 421_611,
    url: infuraUrl("arbitrum-goerli"),
    isTestnet: true,
    isLayer2: true,
  },

  // AVALANCHE
  [NetworkName.AVALANCHE_MAINNET]: {
    chainId: 43_114,
    url: `https://api.avax.network/ext/bc/C/rpc`,
  },
  [NetworkName.FUJI_AVALANCHE]: {
    chainId: 43_113,
    url: `https://api.avax-test.network/ext/bc/C/rpc`,
    isTestnet: true,
  },

  // FANTOM
  [NetworkName.FANTOM_MAINNET]: {
    chainId: 250,
    url: `https://rpcapi.fantom.network`,
  },
  [NetworkName.FANTOM_TESTNET]: {
    chainId: 4_002,
    url: `https://rpc.testnet.fantom.network`,
    isTestnet: true,
  },
} as const;

export const DEVELOPMENT_CHAINS: string[] = ["hardhat", "localhost", "ganache"];
