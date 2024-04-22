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
  "ethereum-sepolia": [
    {
      name: "wETH",
      address: "0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("1500000"),
    },
    {
      name: "wBTC",
      address: "0x028F128035133265Af06ef860e8c9B7684dB87CE",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.2"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("2000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("2000000"),
    },
    {
      // TODO: add later
      name: "USDC",
      address: "0xb09B1692F3EC4451394FB2316E5EbCb5d83A1d70",
      decimals: 6,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("2200"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("2500000"),
    },
  ],
  "optimism-sepolia": [
    {
      name: "ETC",
      address: "0x89775573b60544600989F6d277b9f6e29043dB57",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0xad83e7e17dc7B12FC6cAA0eD580Ea99Cf31A1d4F",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("1500000"),
    },
    {
      name: "NEAR",
      address: "0xe66EaBC866cA0Fb8f99e9c3669c6948424C4FD34",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x722A880509fc71cD72d5B883d52f93A0B48e1160",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.2"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("2000"),
      gasCompensation: parseEther("200"),
      mintCap: parseEther("2000000"),
    },
  ],
  "arbitrum-sepolia": [
    {
      name: "BNB",
      address: "0x89775573b60544600989F6d277b9f6e29043dB57",
      decimals: 18,
      borrowingFee: parseEther("0.01"),
      oracleAddress: "0x53ab995fBb01C617aa1256698aD55b417168bfF9",
      oracleTimeoutMinutes: 1440,
      oracleIsEthIndexed: false,
      MCR: parseEther("1.1"),
      CCR: parseEther("1.5"),
      minNetDebt: parseEther("1800"),
      gasCompensation: parseEther("300"),
      mintCap: parseEther("2000000"),
    },
  ],
} as const;
