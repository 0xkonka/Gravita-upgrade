import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanMintFromWhitelistedContract(): void {
  context("when caller is whitelisted contract", function () {
    beforeEach(async function () {
      this.whitelistedContract = this.signers.accounts[1];

      await this.contracts.debtToken.addWhitelist(this.whitelistedContract.address);
    });

    it("mints tokens", async function () {
      const amountToMint = 100n;

      const initialWhitelistedContractBalance = await this.contracts.debtToken.balanceOf(
        this.whitelistedContract.address
      );

      await this.contracts.debtToken
        .connect(this.whitelistedContract)
        .mintFromWhitelistedContract(amountToMint);

      const debtTokenBalance = await this.contracts.debtToken.balanceOf(
        this.whitelistedContract.address
      );

      expect(debtTokenBalance).to.be.equal(initialWhitelistedContractBalance + amountToMint);
    });

    it("emits a Transfer event", async function () {
      const amountToMint = 100n;

      await expect(
        this.contracts.debtToken
          .connect(this.whitelistedContract)
          .mintFromWhitelistedContract(amountToMint)
      )
        .to.emit(this.contracts.debtToken, "Transfer")
        .withArgs(ethers.ZeroAddress, this.whitelistedContract.address, amountToMint);
    });

    it("updates total supply", async function () {
      const amountToMint = 100n;
      const initialTotalSupply = await this.contracts.debtToken.totalSupply();

      await this.contracts.debtToken
        .connect(this.whitelistedContract)
        .mintFromWhitelistedContract(amountToMint);

      const totalSupply = await this.contracts.debtToken.totalSupply();

      expect(totalSupply).to.be.equal(initialTotalSupply + amountToMint);
    });
  });
  context("when caller is not whitelisted contract", function () {
    it("reverts", async function () {
      const amountToMint = 100n;
      const notWhitelistedContract = this.signers.accounts[2];

      await expect(
        this.contracts.debtToken
          .connect(notWhitelistedContract)
          .mintFromWhitelistedContract(amountToMint)
      ).to.be.revertedWith("DebtToken: Caller is not a whitelisted SC");
    });
  });
}
