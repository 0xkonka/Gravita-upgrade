import { expect } from "chai";

export default function shouldBehaveLikeGetAllCollateral(): void {
  context("get all collateral", function () {
    it("should get all collateral in StabilityPool", async function () {
      const { testCollateral } = this.collaterals.notAdded;
      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const [tokensInStabilityPool] = await this.contracts.stabilityPool.getAllCollateral();

      expect(tokensInStabilityPool).to.include(testCollateral.address);
    });
  });
}
