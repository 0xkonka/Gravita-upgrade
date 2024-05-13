import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

function getApiKeyForNetwork(network: NetworkName) {
  const formattedNetwork = network.toUpperCase().replace("-", "_");
  const apiKey = process.env[`${formattedNetwork}_API_KEY`];
  if (!apiKey) {
    throw new Error(`${formattedNetwork}_API_KEY must be defined in .env file.`);
  }
  return apiKey;
}

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

  // Tenderly Virtual Testnet
  TENDERLY_MAINNET = "tenderly-mainnet",
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
    url: `https://eth-mainnet.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.ETHEREUM_MAINNET)}`,
  },
  [NetworkName.ETHEREUM_SEPOLIA]: {
    chainId: 11155111,
    url: `https://eth-sepolia.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.ETHEREUM_SEPOLIA)}`,
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
    url: `https://polygon-mainnet.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.POLYGON_MAINNET)}`,
  },
  [NetworkName.POLYGON_MUMBAI]: {
    chainId: 80_001,
    url: `https://polygon-mumbai.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.POLYGON_MUMBAI)}`,
    isTestnet: true,
  },

  // OPTIMISM
  [NetworkName.OPTIMISM_MAINNET]: {
    chainId: 10,
    url: `https://opt-mainnet.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.OPTIMISM_MAINNET)}`,
    isLayer2: true,
  },
  [NetworkName.OPTIMISM_SEPOLIA]: {
    chainId: 11155420,
    url: `https://opt-sepolia.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.OPTIMISM_SEPOLIA)}`,
    isTestnet: true,
    isLayer2: true,
  },

  // ARBITRUM
  [NetworkName.ARBITRUM_MAINNET]: {
    chainId: 42_161,
    url: `https://arb-mainnet.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.ARBITRUM_MAINNET)}`,
    isLayer2: true,
  },
  [NetworkName.ARBITRUM_SEPOLIA]: {
    chainId: 421_614,
    url: `https://arb-sepolia.g.alchemy.com/v2/${getApiKeyForNetwork(NetworkName.ARBITRUM_SEPOLIA)}`,
    isTestnet: true,
    isLayer2: true,
  },

  // AVALANCHE
  [NetworkName.AVALANCHE_MAINNET]: {
    chainId: 43_114,
    url: "https://api.avax.network/ext/bc/C/rpc",
  },
  [NetworkName.FUJI_AVALANCHE]: {
    chainId: 43_113,
    url: "https://api.avax-test.network/ext/bc/C/rpc",
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

  // Tenderly Virtual Testnet
  [NetworkName.TENDERLY_MAINNET]: {
    chainId: 1771,
    url: `https://virtual.mainnet.rpc.tenderly.co/${getApiKeyForNetwork(NetworkName.TENDERLY_MAINNET)}`,
    isTestnet: true,
  },
} as const;

export const DEVELOPMENT_CHAINS: string[] = ["hardhat", "localhost", "ganache"];
