import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanBurnFromWhitelistedContract(): void {
  beforeEach(async function () {
    this.whitelistedContract = this.signers.accounts[1];

    const amountToMint = 1000n;

    await this.contracts.debtToken.addWhitelist(this.whitelistedContract.address);

    await this.contracts.debtToken
      .connect(this.whitelistedContract)
      .mintFromWhitelistedContract(amountToMint);
  });

  context("when caller is whitelisted contract", function () {
    beforeEach(async function () {
      this.whitelistedContract = this.signers.accounts[1];

      const amountToMint = 1000n;

      await this.contracts.debtToken.addWhitelist(this.whitelistedContract.address);

      await this.contracts.debtToken
        .connect(this.whitelistedContract)
        .mintFromWhitelistedContract(amountToMint);
    });

    context("when contract has enough tokens", function () {
      it("burns tokens", async function () {
        const amountToBurn = 100n;

        const initialWhitelistedContractBalance = await this.contracts.debtToken.balanceOf(
          this.whitelistedContract.address
        );

        await this.contracts.debtToken
          .connect(this.whitelistedContract)
          .burnFromWhitelistedContract(amountToBurn);

        const debtTokenBalance = await this.contracts.debtToken.balanceOf(
          this.whitelistedContract.address
        );

        expect(debtTokenBalance).to.be.equal(initialWhitelistedContractBalance - amountToBurn);
      });

      it("emits a Transfer event", async function () {
        const amountToBurn = 100n;

        await expect(
          this.contracts.debtToken
            .connect(this.whitelistedContract)
            .burnFromWhitelistedContract(amountToBurn)
        )
          .to.emit(this.contracts.debtToken, "Transfer")
          .withArgs(this.whitelistedContract.address, ethers.ZeroAddress, amountToBurn);
      });

      it("updates total supply", async function () {
        const amountToBurn = 100n;
        const initialTotalSupply = await this.contracts.debtToken.totalSupply();

        await this.contracts.debtToken
          .connect(this.whitelistedContract)
          .burnFromWhitelistedContract(amountToBurn);

        const totalSupply = await this.contracts.debtToken.totalSupply();

        expect(totalSupply).to.be.equal(initialTotalSupply - amountToBurn);
      });
    });

    context("when contract does not have enough tokens", function () {
      it("reverts", async function () {
        const initialWhitelistedContractBalance = await this.contracts.debtToken.balanceOf(
          this.whitelistedContract.address
        );
        const amountToBurn = initialWhitelistedContractBalance + 1n;

        await expect(
          this.contracts.debtToken
            .connect(this.whitelistedContract)
            .burnFromWhitelistedContract(amountToBurn)
        ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
      });
    });
  });

  context("when caller is not whitelisted contract", function () {
    beforeEach(async function () {
      await this.contracts.debtToken.removeWhitelist(this.whitelistedContract.address);

      this.previouslyWhitelistedContract = this.whitelistedContract;
    });

    it("reverts", async function () {
      const amountToBurn = 100n;

      await expect(
        this.contracts.debtToken
          .connect(this.previouslyWhitelistedContract)
          .burnFromWhitelistedContract(amountToBurn)
      ).to.be.revertedWith("DebtToken: Caller is not a whitelisted SC");
    });
  });
}
