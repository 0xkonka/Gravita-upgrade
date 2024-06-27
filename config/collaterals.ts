import { config as dotenvConfig } from "dotenv";
import { AddressLike, BigNumberish, BytesLike, parseEther } from "ethers";
import { resolve } from "path";

import { NetworkName } from "./networks";

export enum ORACLE_PROVIDER_TYPE {
  Chainlink = 0,
  API3 = 1,
  Pyth = 2,
}

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

export interface Collateral {
  name: string;
  address: AddressLike;
  decimals: BigNumberish;
  borrowingFee: BigNumberish;
  oracleAddress: AddressLike;
  oracleProviderType?: ORACLE_PROVIDER_TYPE;
  oracleTimeoutMinutes: number;
  oracleIsEthIndexed: boolean;
  isFallback?: boolean;
  oracleAdditionalData?: BytesLike;
  MCR: BigNumberish;
  CCR: BigNumberish;
  minNetDebt: BigNumberish;
  gasCompensation: BigNumberish;
  mintCap: BigNumberish;
}

export const LOCAL_NETWORK_COLLATERALS: Collateral[] = [
  {
    name: "wETH",
    address: "0x1A0A7c9008Aa351cf8150a01b21Ff2BB98D70D2D",
    decimals: 18,
    borrowingFee: parseEther("0.01"),
    oracleAddress: "0xE8BAde28E08B469B4EeeC35b9E48B2Ce49FB3FC9",
    oracleTimeoutMinutes: 1440,
    oracleIsEthIndexed: false,
    MCR: parseEther("1.25"),
    CCR: parseEther("1.5"),
    minNetDebt: parseEther("1800"),
    gasCompensation: parseEther("300"),
    mintCap: parseEther("1500000"),
  },
];

export const COLLATERALS: { readonly [key in NetworkName]?: Collateral[] } = {
  "ethereum-sepolia": [
    {
      name: "wETH",
      address: "0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.05"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "wstETH",
      address: "0xc8C82D289917cfF26D4984A30F494555ccF52793",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.2"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "eETH",
      address: "0x78865925d1453A886e053CAC159B1881129bf1AA",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.2"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "ONDO",
      address: "0xF03716cdF6F634aAD5D271F4c214c79bDcF535Ad",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0xB0C712f98daE15264c8E26132BCC91C40aD4d5F9",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.5"),
      CCR: parseEther("1.8"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "tricryptov2",
      address: "0x15Eb0907e77Ac494c1c6246FB2Ec15A06A0da380",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "sDAI",
      address: "0x60535E2Eb4EEd7Ef43ce498883D87C6FdeDf7a59",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "PT-weETH-26DEC2024",
      address: "0x157713D46Df829c23C88Ac47B8d7449D885A214a",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.5"),
      CCR: parseEther("1.8"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "Pepe",
      address: "0x1301Dac734B0c90eDF4CA4DcFD4D01a9F5F6e845",
      decimals: 18,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.5"),
      CCR: parseEther("1.8"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "Trump",
      address: "0x77ed3866d3Bdd5d950CA46443900795B0dc15751",
      decimals: 18,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.6"),
      CCR: parseEther("1.9"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
    {
      name: "USDC",
      address: "0xE47894826F012A152ADaE0111596D5675872f6Bb",
      decimals: 6,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.05"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("1000000"),
    },
  ],
  "ethereum-mainnet": [
    {
      name: "wETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.05"),
      CCR: parseEther("1.45"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "wstETH",
      address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "weETH",
      address: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0x5c9C449BbC9a6075A2c061dF312a35fd1E05fF22",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.05"),
      CCR: parseEther("1.45"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "wTAO",
      address: "0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44",
      decimals: 9,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0x1c88503c9A52aE6aaE1f9bb99b3b7e9b8Ab35459",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "sDAI",
      address: "0x83f20f44975d03b1b09e64809b757c47f942beea",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "PEPE",
      address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
      decimals: 18,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "ONDO",
      address: "0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "TRUMP",
      address: "0x576e2BeD8F7b46D34016198911Cdf9886f78bea7",
      decimals: 9,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.8"),
      CCR: parseEther("2.2"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "tricrypto2",
      address: "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
      decimals: 18,
      borrowingFee: parseEther("0.01"), //  to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "RNDR",
      address: "0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24",
      decimals: 18,
      borrowingFee: parseEther("0.01"), //  to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "BANANA",
      address: "0x38E68A37E401F7271568CecaAc63c6B1e19130B4",
      decimals: 18,
      borrowingFee: parseEther("0.01"), //  to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.8"),
      CCR: parseEther("2.2"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "PAAL",
      address: "0x14feE680690900BA0ccCfC76AD70Fd1b95D10e16",
      decimals: 9,
      borrowingFee: parseEther("0.01"), //  to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "BabyDoge",
      address: "0xAC57De9C1A09FeC648E93EB98875B212DB0d460B",
      decimals: 9,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("2"),
      CCR: parseEther("2.4"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "Floki",
      address: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E",
      decimals: 9,
      borrowingFee: parseEther("0.02"),
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
    {
      name: "PANDORA",
      address: "0x9E9FbDE7C7a83c43913BddC8779158F1368F0413",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.8"),
      CCR: parseEther("2.2"),
      minNetDebt: parseEther("1000"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("1000000"), // to be added
    },
  ],
  "mode-mainnet": [
    {
      name: "MODE",
      address: "0xDfc7C877a950e49D2610114102175A06C2e3167a",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x0386e113cc716a7c6a55decd97b19c90ce080d9f2f5255ac78a0e26889446d1e",
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("50000"), // to be added
    },
    {
      name: "wETH",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("100000"), // to be added
    },
    {
      name: "ionWETH",
      address: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
      MCR: parseEther("1.55"),
      CCR: parseEther("1.95"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "M-BTC",
      address: "0x59889b7021243dB5B1e065385F918316cD90D46c",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x6665073f5bc307b97e68654ff11f3d8875abd6181855814d23ab01b8085c0906",
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("100000"), // to be added
    },
    {
      name: "weETH.mode",
      address: "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9ee4e7c60b940440a261eb54b6d8149c23b580ed7da3139f7f08f4ea29dad395",
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), //  to be added
      mintCap: parseEther("75000"), // to be added
    },
    {
      name: "KIM-LP",
      address: "0x812D54D483bF049980Af7ceB57DBf77Fa186d063",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "ionUSDT",
      address: "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3",
      decimals: 6,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "ionUSDC",
      address: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038",
      decimals: 6,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
      MCR: parseEther("1.25"),
      CCR: parseEther("1.65"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "lETH",
      address: "0xe855B8018C22A05F84724e93693caf166912aDD5",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      MCR: parseEther("1.8"),
      CCR: parseEther("2.2"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "ironETH",
      address: "0x9c29a8eC901DBec4fFf165cD57D4f9E03D4838f7",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
      MCR: parseEther("1.8"),
      CCR: parseEther("2.2"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
    {
      name: "fWETH(ezETH)-5",
      address: "0xb93B53CA8a51A78348a9B22718ca7fe77D13B900",
      decimals: 18,
      borrowingFee: parseEther("0.01"), // to be added
      oracleAddress: "", // to be added
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      oracleProviderType: ORACLE_PROVIDER_TYPE.Pyth,
      oracleAdditionalData: "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
      MCR: parseEther("2.5"),
      CCR: parseEther("2.9"),
      minNetDebt: parseEther("500"), // to be added
      gasCompensation: parseEther("200"), // to be added
      mintCap: parseEther("25000"), // to be added
    },
  ],
} as const;
