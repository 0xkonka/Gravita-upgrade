import { ethers, getNamedAccounts } from "hardhat";

import { PriceFeed } from "../../../types";

export async function priceFeedFixture(): Promise<{
  priceFeed: PriceFeed;
}> {
  const { deployer } = await getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);

  const PriceFeedFactory = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeedFactory.connect(deployerSigner).deploy();
  await priceFeed.waitForDeployment();
  await priceFeed.initialize(deployer);

  return {
    priceFeed,
  };
}
