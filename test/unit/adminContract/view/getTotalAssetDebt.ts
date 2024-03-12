import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetTotalAssetDebt(): void {
  context("after deployment", function () {
    context("with active collaterals", function () {
      it("should return ZERO", async function () {
        const { wETH } = this.collaterals.active;

        const totalAssetDebt = await this.contracts.adminContract.getTotalAssetDebt(wETH.address);

        expect(totalAssetDebt).to.be.equal(0n);
      });

      context("with inactive collaterals", function () {
        it("should return ZERO", async function () {
          const { dai } = this.collaterals.inactive;

          const totalAssetDebt = await this.contracts.adminContract.getTotalAssetDebt(dai.address);

          expect(totalAssetDebt).to.be.equal(0n);
        });
      });

      context("with non-existent collaterals", function () {
        it("should return ZERO", async function () {
          const nonExistentCollateral = ethers.ZeroAddress;

          const totalAssetDebt =
            await this.contracts.adminContract.getTotalAssetDebt(nonExistentCollateral);

          expect(totalAssetDebt).to.be.equal(0n);
        });
      });
    });
  });
}
