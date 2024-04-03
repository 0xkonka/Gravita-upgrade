import { expect } from "chai";

export default function shouldBehaveLikeGetSnapshot(): void {
  context("get depositor's debt token gain amount ", function () {
    it("should return depositor gains", async function () {

      const { wETH } = this.collaterals.active;
      const user = this.signers.accounts[1]

      const snapShot = await this.contracts.stabilityPool.S(user, wETH.address);

      expect(snapShot).to.deep.equal(0n);

    });
  });

}
