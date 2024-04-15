import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
if (typeof ALCHEMY_KEY === "undefined") {
  console.log(`ALCHEMY_KEY must be a defined environment variable`);
}

const alchemyUrl = (network: string): string => {
  const prefix = getPrefix(network);
  const formattedNetwork = formatNetworkName(network);
  const apiKey = process.env[`${formattedNetwork}_API_KEY`];
  if (!apiKey) {
    throw new Error(`${formattedNetwork}_API_KEY must be defined in the environment variables.`);
  }

  return `https://${prefix}sepolia.g.alchemy.com/v2/${apiKey}`;
};

const getPrefix = (network: string): string => {
  if (network.startsWith("optimism-")) {
    return "opt-";
  } else if (network.startsWith("arbitrum-")) {
    return "arb-";
  } else {
    return "eth-";
  }
};

const formatNetworkName = (network: string): string => {
  return network.toUpperCase().replace("-", "_");
};

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
  ETHEREUM_MAINNET = "ethereum-mainnet",
  ETHEREUM_SEPOLIA = "ethereum-sepolia",

  // BINANCE SMART CHAIN
  BSC = "bsc",
  BSC_TESTNET = "bsc-testnet",

  // POLYGON
  POLYGON_MAINNET = "polygon-mainnet",
  POLYGON_MUMBAI = "polygon-mumbai",

  // OPTIMISM
  OPTIMISM_MAINNET = "optimism-mainnet",
  OPTIMISM_SEPOLIA = "optimism-sepolia",

  // ARBITRUM
  ARBITRUM_MAINNET = "arbitrum-mainnet",
  ARBITRUM_SEPOLIA = "arbitrum-sepolia",

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
  [NetworkName.ETHEREUM_MAINNET]: {
    chainId: 1,
    url: alchemyUrl("ethereum-mainnet"),
  },
  [NetworkName.ETHEREUM_SEPOLIA]: {
    chainId: 11155111,
    url: alchemyUrl("ethereum-sepolia"),
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
    url: alchemyUrl("polygon-mainnet"),
  },
  [NetworkName.POLYGON_MUMBAI]: {
    chainId: 80_001,
    url: alchemyUrl("polygon-mumbai"),
    isTestnet: true,
  },

  // OPTIMISM
  [NetworkName.OPTIMISM_MAINNET]: {
    chainId: 10,
    url: alchemyUrl("optimism-mainnet"),
    isLayer2: true,
  },
  [NetworkName.OPTIMISM_SEPOLIA]: {
    chainId: 11155420,
    url: alchemyUrl("optimism-sepolia"),
    isTestnet: true,
    isLayer2: true,
  },

  // ARBITRUM
  [NetworkName.ARBITRUM_MAINNET]: {
    chainId: 42_161,
    url: alchemyUrl("arbitrum-mainnet"),
    isLayer2: true,
  },
  [NetworkName.ARBITRUM_SEPOLIA]: {
    chainId: 421_614,
    url: alchemyUrl("arbitrum-sepolia"),
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
