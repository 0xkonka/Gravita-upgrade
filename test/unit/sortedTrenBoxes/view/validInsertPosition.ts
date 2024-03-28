import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize();

    this.impostor = this.signers.accounts[1];

    const users = [
      this.signers.accounts[2],
      this.signers.accounts[3],
      this.signers.accounts[4],
      this.signers.accounts[5],
    ];
    await this.utils.setUsers(users);

    const { erc20 } = this.testContracts;

    const assetAddress = await erc20.getAddress();
    const assetAmount = ethers.parseUnits("100", 30);

    const mintCap = ethers.parseUnits("100", 35);

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20,
          collateralOptions: {
            setAsActive: true,
            mintCap,
            price: ethers.parseUnits("200", "ether"),
            mints: users.map((user) => {
              return {
                to: user.address,
                amount: ethers.parseUnits("100", 30),
              };
            }),
          },
        },
      ],
      commands: users.map((user) => {
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
  });

  context("for active collateral", function () {
    it("check valid insert position", async function () {
      const { sortedTrenBoxes } = this.contracts;
      const { erc20 } = this.testContracts;

      const position = await sortedTrenBoxes.findInsertPosition(
        erc20,
        2n,
        this.users[0],
        this.users[3]
      );

      const valid = await sortedTrenBoxes.validInsertPosition(erc20, 2n, position[0], position[1]);

      expect(valid).to.be.equal(true);
    });
  });
}
