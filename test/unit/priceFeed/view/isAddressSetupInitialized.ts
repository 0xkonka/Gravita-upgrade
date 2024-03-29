import { expect } from "chai";

export default function shouldHaveIsAddressSetupInitialized(): void {
  it.skip("should expose isAddressSetupInitialized flag", async function () {
    expect(await this.redeployedContracts.priceFeed.isAddressSetupInitialized()).to.be.equal(true);
  });
}
