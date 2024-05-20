import { config as dotenvConfig } from "dotenv";
import { AddressLike, BigNumberish, BytesLike, parseEther } from "ethers";
import { resolve } from "path";

import { NetworkName } from "./networks";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

export interface Collateral {
  name: string;
  address: AddressLike;
  decimals: BigNumberish;
  borrowingFee: BigNumberish;
  oracleAddress: AddressLike;
  oracleTimeoutMinutes: number;
  oracleIsEthIndexed: boolean;
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
} as const;
