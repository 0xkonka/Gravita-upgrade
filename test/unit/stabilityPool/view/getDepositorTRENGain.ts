import { expect } from "chai";

export default function shouldBehaveLikeGetDepositorTRENGain(): void {
  context("get depositor's debt token gain amount ", function () {
    it("should return depositor gains", async function () {

      const { wETH } = this.collaterals.active;
      const user = this.signers.accounts[1]

      const depositorGains = await this.contracts.stabilityPool.getDepositorGains(user, [wETH.address]);

      expect(depositorGains).to.deep.equal([[], []]);

    });
  });

}
