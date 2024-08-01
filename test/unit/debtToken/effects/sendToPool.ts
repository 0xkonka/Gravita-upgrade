import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendToPool(): void {
  context("when caller is StabilityPool", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;

      this.collateral = this.collaterals.active.wETH;

      const amountTokensToMint = 500;
      this.tokenHolder = this.signers.accounts[0].address;

      const trenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();

      const borrowerOperationsImpostor = this.signers.accounts[1];

      this.stabilityPool = this.signers.accounts[1];

      await this.redeployedContracts.debtToken.setAddresses(
        borrowerOperationsImpostor.address,
        this.stabilityPool.address,
        trenBoxManagerAddress
      );

      await this.redeployedContracts.debtToken
        .connect(borrowerOperationsImpostor)
        .mint(this.collateral.address, this.tokenHolder, amountTokensToMint);

      this.poolAddress = this.signers.accounts[2].address;
    });

    context("when sending to correct pool address", function () {
      it("transfers tokens to specified pool address", async function () {
        const amountToSend = 100n;

        const initialPoolBalance = await this.redeployedContracts.debtToken.balanceOf(
          this.poolAddress
        );
        const initialHolderBalance = await this.redeployedContracts.debtToken.balanceOf(
          this.tokenHolder
        );

        await this.redeployedContracts.debtToken
          .connect(this.stabilityPool)
          .sendToPool(this.tokenHolder, this.poolAddress, amountToSend);

        const poolBalance = await this.redeployedContracts.debtToken.balanceOf(this.poolAddress);
        const holderBalance = await this.redeployedContracts.debtToken.balanceOf(this.tokenHolder);

        expect(poolBalance).to.be.equal(initialPoolBalance + amountToSend);
        expect(holderBalance).to.be.equal(initialHolderBalance - amountToSend);
      });

      it("emits a Transfer event", async function () {
        const amountToSend = 100n;

        await expect(
          this.redeployedContracts.debtToken
            .connect(this.stabilityPool)
            .sendToPool(this.tokenHolder, this.poolAddress, amountToSend)
        )
          .to.emit(this.redeployedContracts.debtToken, "Transfer")
          .withArgs(this.tokenHolder, this.poolAddress, amountToSend);
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
