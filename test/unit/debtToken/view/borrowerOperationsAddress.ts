import { expect } from "chai";

export default function shouldBehaveLikeHaveBorrowerOperationsAddress(): void {
  it("should retrieve correct borrower operations address", async function () {
    expect(await this.contracts.debtToken.borrowerOperationsAddress()).to.be.equal(
      await this.contracts.borrowerOperations.getAddress()
    );
  });
}
