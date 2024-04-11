import { expect } from "chai";

export default function shouldBehaveLikeCanSendToPool(): void {
  context("when caller is StabilityPool", function () {
    beforeEach(async function () {
      this.collateral = this.collaterals.active.wETH;

      const amountTokensToMint = 500;
      this.tokenHolder = this.signers.accounts[0].address;

      const borrowerOperationsAddress = await this.contracts.borrowerOperations.getAddress();
      const stabilityPoolAddress = await this.contracts.stabilityPool.getAddress();
      const trenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();

      const borrowerOperationsImpostor = this.signers.accounts[1];
      await this.contracts.debtToken.setAddresses(
        borrowerOperationsImpostor.address,
        stabilityPoolAddress,
        trenBoxManagerAddress
      );

      await this.contracts.debtToken
        .connect(borrowerOperationsImpostor)
        .mint(this.collateral.address, this.tokenHolder, amountTokensToMint);

      this.stabilityPool = this.signers.accounts[1];

      await this.contracts.debtToken.setAddresses(
        borrowerOperationsAddress,
        this.stabilityPool.address,
        trenBoxManagerAddress
      );

      this.poolAddress = this.signers.accounts[2].address;
    });

    context("when sending to correct pool address", function () {
      it("transfers tokens to specified pool address", async function () {
        const amountToSend = 100n;

        const initialPoolBalance = await this.contracts.debtToken.balanceOf(this.poolAddress);
        const initialHolderBalance = await this.contracts.debtToken.balanceOf(this.tokenHolder);

        await this.contracts.debtToken
          .connect(this.stabilityPool)
          .sendToPool(this.tokenHolder, this.poolAddress, amountToSend);

        const poolBalance = await this.contracts.debtToken.balanceOf(this.poolAddress);
        const holderBalance = await this.contracts.debtToken.balanceOf(this.tokenHolder);

        expect(poolBalance).to.be.equal(initialPoolBalance + amountToSend);
        expect(holderBalance).to.be.equal(initialHolderBalance - amountToSend);
      });

      it("emits a Transfer event", async function () {
        const amountToSend = 100n;

        await expect(
          this.contracts.debtToken
            .connect(this.stabilityPool)
            .sendToPool(this.tokenHolder, this.poolAddress, amountToSend)
        )
          .to.emit(this.contracts.debtToken, "Transfer")
          .withArgs(this.tokenHolder, this.poolAddress, amountToSend);
      });
    });

    context("when sending to incorrect pool address", function () {
      context("when pool address is zero", function () {
        it.skip("reverts", async function () {
          const amountToSend = 100n;

          await expect(
            this.contracts.debtToken
              .connect(this.stabilityPool)
              .sendToPool(this.tokenHolder, this.signers.accounts[0].address, amountToSend)
          ).to.be.reverted;
        });
      });
    });
  });

  context("when caller is not StabilityPool", function () {
    it("reverts", async function () {
      const amountToSend = 100n;

      const stabilityPoolImpostor = this.signers.accounts[0];

      await expect(
        this.contracts.debtToken
          .connect(stabilityPoolImpostor)
          .sendToPool(
            this.signers.accounts[0].address,
            this.signers.accounts[1].address,
            amountToSend
          )
      )
        .to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__CallerIsNotStabilityPool"
        )
        .withArgs(stabilityPoolImpostor.address);
    });
  });
}
