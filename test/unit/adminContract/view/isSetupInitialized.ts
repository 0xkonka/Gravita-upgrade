import { expect } from "chai";

export default function shouldHaveIsSetupInitialized(): void {
  it.skip("should expose isSetupInitialized flag", async function () {
    expect(await this.contracts.adminContract.isSetupInitialized()).to.be.equal(true);
  });
}
