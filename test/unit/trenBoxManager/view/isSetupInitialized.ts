import { expect } from "chai";

export default function shouldHaveIsSetupInitialized(): void {
  it("should expose isSetupInitialized flag", async function () {
    expect(await this.contracts.trenBoxManager.isSetupInitialized()).to.be.equal(false);
  });
}
