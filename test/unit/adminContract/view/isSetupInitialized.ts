import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveIsSetupInitialized(): void {
  it("should expose isSetupInitialized flag", async function () {
    await this.contracts.adminContract.setSetupIsInitialized();

    expect(await this.contracts.adminContract.isSetupInitialized()).to.be.equal(true);
  });
}
