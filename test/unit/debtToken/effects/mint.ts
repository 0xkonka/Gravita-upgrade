import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanMint(): void {
  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;

      const borrowerOperationsImpostor = this.signers.accounts[1];
      const stabilityPoolAddress = await this.contracts.stabilityPool.getAddress();
      const trenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();

      await this.redeployedContracts.debtToken.setAddresses(
        borrowerOperationsImpostor.address,
        stabilityPoolAddress,
        trenBoxManagerAddress
      );

      this.borrowerOperationsImpostor = borrowerOperationsImpostor;
      this.collateral = this.collaterals.active.wETH;
      this.tokenRecipient = this.signers.accounts[2];
    });

    context("when collateral is not stopped", function () {
      it("mints tokens", async function () {
        const amountToMint = 100;

        await this.redeployedContracts.debtToken
          .connect(this.borrowerOperationsImpostor)
          .mint(this.collateral.address, this.tokenRecipient.address, amountToMint);

        const debtTokenBalance = await this.redeployedContracts.debtToken.balanceOf(
          this.tokenRecipient.address
        );

        expect(debtTokenBalance).to.be.equal(amountToMint);
      });

      it("emits a Transfer event", async function () {
        const amountToMint = 100;

        await expect(
          this.redeployedContracts.debtToken
            .connect(this.borrowerOperationsImpostor)
            .mint(this.collateral.address, this.tokenRecipient.address, amountToMint)
        )
          .to.emit(this.redeployedContracts.debtToken, "Transfer")
          .withArgs(ethers.ZeroAddress, this.tokenRecipient.address, amountToMint);
      });

      it("updates total supply", async function () {
        const amountToMint = 100n;
        const initialTotalSupply = await this.redeployedContracts.debtToken.totalSupply();

        await this.redeployedContracts.debtToken
          .connect(this.borrowerOperationsImpostor)
          .mint(this.collateral.address, this.tokenRecipient.address, amountToMint);

        const totalSupply = await this.redeployedContracts.debtToken.totalSupply();

        expect(totalSupply).to.be.equal(initialTotalSupply + amountToMint);
      });
    });

    context("when collateral is stopped", function () {
      it("reverts", async function () {
        const amountToMint = 100;

        await this.redeployedContracts.debtToken.emergencyStopMinting(
          this.collateral.address,
          true
        );

        await expect(
          this.redeployedContracts.debtToken
            .connect(this.borrowerOperationsImpostor)
            .mint(this.collateral.address, this.tokenRecipient.address, amountToMint)
        ).to.be.revertedWithCustomError(
          this.redeployedContracts.debtToken,
          "DebtToken__MintBlockedForCollateral"
        );
      });
    });
  });

  context("when caller is not borrower operations", function () {
    it("reverts", async function () {
      const notBorrowerOperations = this.signers.accounts[1];
      const tokenRecipient = this.signers.accounts[2];
      const amountToMint = 100;

      const collateral = this.collaterals.active.wETH;

      await expect(
        this.contracts.debtToken
          .connect(notBorrowerOperations)
          .mint(collateral.address, tokenRecipient.address, amountToMint)
      )
        .to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__CallerIsNotBorrowerOperations"
        )
        .withArgs(notBorrowerOperations.address);
    });
  });
}
