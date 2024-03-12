import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetMinNetDebt(): void {
  context("for active collateral", function () {
    it("should return correct min net debt", async function () {
      const { wETH } = this.collaterals.active;

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(wETH.address);

      expect(minNetDebt).to.be.equal(wETH.minNetDebt);
    });
  });

  context("for inactive collateral", function () {
    it("should return MIN_NET_DEBT_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;
      const expectedDefaultMinNetDebt = await this.contracts.adminContract.MIN_NET_DEBT_DEFAULT();

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(dai.address);

      expect(minNetDebt).to.be.equal(expectedDefaultMinNetDebt);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(nonExistentCollateral);

      expect(minNetDebt).to.be.equal(0);
    });
  });
}
