import { expect } from "chai";

export default function shouldBehaveLikeGetFlashLoanRate(): void {
  it("should retrieve flash loan rate", async function () {
    expect(await this.contracts.flashLoan.getFlashLoanRate()).to.be.equal(0);
  });
}
