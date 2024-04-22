import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize(this.signers.deployer);

    const users = this.signers.accounts.slice(2, 6);

    const { erc20 } = this.testContracts;

    const mintCap = ethers.parseUnits("100", 35);
    const assetAddress = await erc20.getAddress();
    const assetAmount = ethers.parseUnits("100", 30);

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20,
          collateralOptions: {
            setAsActive: true,
            price: ethers.parseUnits("200", "ether"),
            mintCap,
            mints: users.map((user) => {
              return {
                to: user.address,
                amount: ethers.parseUnits("100", 30),
              };
            }),
          },
        },
      ],
      commands: users.map((user: HardhatEthersSigner) => {
        return {
          action: "openTrenBox",
          args: {
            asset: assetAddress,
            assetAmount,
            from: user,
          },
        };
      }),
    });

    await this.utils.setUsers(users);
  });

  context("for active collateral", function () {
    it("find insert Position", async function () {
      const { sortedTrenBoxes } = this.contracts;
      const { erc20 } = this.testContracts;

      const previousPositionId = this.users[0];
      const nextPositionId = this.users[3];

      const position = await sortedTrenBoxes.findInsertPosition(
        erc20,
        2n,
        previousPositionId,
        nextPositionId
      );
      expect(position[0]).to.be.equal(this.users[0]);
    });
  });
}
