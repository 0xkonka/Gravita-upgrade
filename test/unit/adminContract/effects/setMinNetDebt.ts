import { expect } from "chai";
import { ethers } from "ethers";

const MIN_NET_DEBT = ethers.parseEther("0");
const MAX_MIN_NET_DEBT = ethers.parseEther("2000");

export default function shouldBehaveLikeCanSetMinNetDebt(): void {
  context("when modifying min net debt on active collateral", function () {
    it("set min net debt should match value", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const minNetDebt = ethers.parseEther("1234");

      await this.contracts.adminContract.setMinNetDebt(collateralAddress, minNetDebt);

      expect(await this.contracts.adminContract.getMinNetDebt(collateralAddress)).to.be.equal(
        minNetDebt
      );
    });

    it("should emit MinNetDebtChanged event", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const oldMinNetDebt = await this.contracts.adminContract.getMinNetDebt(collateralAddress);

      const minNetDebt = ethers.parseEther("1234");

      await expect(this.contracts.adminContract.setMinNetDebt(collateralAddress, minNetDebt))
        .to.emit(this.contracts.adminContract, "MinNetDebtChanged")
        .withArgs(oldMinNetDebt, minNetDebt);
    });

    it("setting min net debt too high should revert", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const minNetDebt = MAX_MIN_NET_DEBT + 1n;

      await expect(this.contracts.adminContract.setMinNetDebt(collateralAddress, minNetDebt))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("Min Net Debt", minNetDebt, MIN_NET_DEBT, MAX_MIN_NET_DEBT);
    });

    it("only owner can set min net debt", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const minNetDebt = ethers.parseEther("1234");

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract
          .connect(anotherAccount)
          .setMinNetDebt(collateralAddress, minNetDebt)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying min net debt on inactive collateral", function () {
    it("set min net debt should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const minNetDebt = ethers.parseEther("1234");

      await expect(
        this.contracts.adminContract.setMinNetDebt(collateralAddress, minNetDebt)
      ).to.be.revertedWith("Collateral is not configured, use setCollateralParameters");
    });
  });
}
