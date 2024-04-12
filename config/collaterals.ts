import { config as dotenvConfig } from "dotenv";
import { AddressLike, BigNumberish, parseEther } from "ethers";
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
  sepolia: [
    {
      name: "wETH",
      address: "0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.25"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("1500000"),
    },
    {
      name: "TNT",
      address: "0x028F128035133265Af06ef860e8c9B7684dB87CE",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.25"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("2000000"),
    },
    {
      name: "FURY",
      address: "0xdB942e0C1F789dd8AA5C18Fba433Ba558e0d0B0d",
      decimals: 6,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.25"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("2000000"),
    },
  ],
} as const;
