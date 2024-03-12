import { parseEther } from "ethers";
import { deployments, ethers } from "hardhat";

import { LOCAL_NETWORK_COLLATERALS } from "../../config/collaterals";
import { Collaterals } from "../shared/types";

const COLLATERALS_TO_ADD_AS_INACTIVE = [
  {
    name: "DAI",
    address: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
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

export async function loadCollateralsFixture(): Promise<Collaterals> {
  const deploymentSummary = await deployments.fixture();
  const adminContract = await ethers.getContractAt(
    "AdminContract",
    deploymentSummary.AdminContract.address
  );

  for (const collateral of COLLATERALS_TO_ADD_AS_INACTIVE) {
    const addCollateralTx = await adminContract.addNewCollateral(
      collateral.address,
      collateral.gasCompensation,
      collateral.decimals
    );

    await addCollateralTx.wait();
  }

  return {
    active: {
      wETH: LOCAL_NETWORK_COLLATERALS[0],
    },
    inactive: {
      dai: COLLATERALS_TO_ADD_AS_INACTIVE[0],
    },
    notAdded: {
      testCollateral: {
        ...LOCAL_NETWORK_COLLATERALS[0],
        address: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
      },
    },
  };
}
