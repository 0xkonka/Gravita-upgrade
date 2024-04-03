import { expect } from "chai";

export default function shouldBehaveLikeNamed(): void {
  it("should retrieve correct Name", async function () {
    expect(await this.contracts.trenBoxManagerOperations.NAME()).to.be.equal(
      "TrenBoxManagerOperations"
    );
  });
}
