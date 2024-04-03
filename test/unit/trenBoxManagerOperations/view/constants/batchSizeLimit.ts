import { expect } from "chai";

export default function shouldBehaveLikeBatchSizeLimit(): void {
  it("should retrieve correct BATCH_SIZE_LIMIT", async function () {
    expect(await this.contracts.trenBoxManagerOperations.BATCH_SIZE_LIMIT()).to.be.equal(25n);
  });
}
