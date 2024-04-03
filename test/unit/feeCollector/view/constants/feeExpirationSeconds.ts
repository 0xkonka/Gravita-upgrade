import { expect } from "chai";

export default function shouldHaveFeeExpirationSeconds(): void {
  it("should retrieve correct FEE_EXPIRATION_SECONDS", async function () {
    const feeExpirationSeconds = 175 * 24 * 3600; // 175 days

    expect(await this.contracts.feeCollector.FEE_EXPIRATION_SECONDS()).to.be.equal(
      feeExpirationSeconds
    );
  });
}
