import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReturnFromPool(): void {
  beforeEach(async function () {
    const owner = this.signers.deployer;

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(owner);
    await debtToken.waitForDeployment();

    this.redeployedContracts.debtToken = debtToken;

    this.collateral = this.collaterals.active.wETH;

    this.tokenHolder = this.signers.accounts[0].address;
    this.pool = this.signers.accounts[1].address;

    this.borrowerOperationsAddress = await this.contracts.borrowerOperations.getAddress();
    this.stabilityPoolAddress = await this.contracts.stabilityPool.getAddress();
    this.trenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();
  });

  context("when caller is trenBoxManager", function () {
    beforeEach(async function () {
      this.caller = this.signers.accounts[2];

      const borrowerOperationsImpostor = this.signers.accounts[1];
      await this.redeployedContracts.debtToken.setAddresses(
        borrowerOperationsImpostor.address,
        this.stabilityPoolAddress,
        this.caller.address
      );

      const amountTokensToMint = 500;
      await this.redeployedContracts.debtToken
        .connect(borrowerOperationsImpostor)
        .mint(this.collateral.address, this.pool, amountTokensToMint);
    });

    shouldBeAbleToReturnFromPool();
  });

  context("when caller is stabilityPool", function () {
    beforeEach(async function () {
      this.caller = this.signers.accounts[2];

      const borrowerOperationsImpostor = this.signers.accounts[1];
      await this.redeployedContracts.debtToken.setAddresses(
        borrowerOperationsImpostor.address,
        this.caller.address,
        this.trenBoxManagerAddress
      );

      const amountTokensToMint = 500;
      await this.redeployedContracts.debtToken
        .connect(borrowerOperationsImpostor)
        .mint(this.collateral.address, this.pool, amountTokensToMint);
    });

    shouldBeAbleToReturnFromPool();
  });

  context("when caller is not trenBoxManager or stabilityPool", function () {
    it("reverts", async function () {
      const impostorCaller = this.signers.accounts[2];

      await expect(
        this.contracts.debtToken
          .connect(impostorCaller)
          .returnFromPool(this.pool, this.tokenHolder, 100n)
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "DebtToken__CannotReturnFromPool");
    });
  });

  function shouldBeAbleToReturnFromPool() {
    context("when pool has sufficient balance", function () {
      context("when recipient is valid", function () {
        it("transfers tokens to specified pool address", async function () {
          const amountToReturn = 100n;

          const initialPoolBalance = await this.redeployedContracts.debtToken.balanceOf(this.pool);
          const initialHolderBalance = await this.redeployedContracts.debtToken.balanceOf(
            this.tokenHolder
          );

          await this.redeployedContracts.debtToken
            .connect(this.caller)
            .returnFromPool(this.pool, this.tokenHolder, amountToReturn);

          const poolBalance = await this.redeployedContracts.debtToken.balanceOf(this.pool);
          const holderBalance = await this.redeployedContracts.debtToken.balanceOf(
            this.tokenHolder
          );

          expect(poolBalance).to.be.equal(initialPoolBalance - amountToReturn);
          expect(holderBalance).to.be.equal(initialHolderBalance + amountToReturn);
        });

        it("emits a Transfer event", async function () {
          const amountToReturn = 100n;

          await expect(
            this.redeployedContracts.debtToken
              .connect(this.caller)
              .returnFromPool(this.pool, this.tokenHolder, amountToReturn)
          )
            .to.emit(this.redeployedContracts.debtToken, "Transfer")
            .withArgs(this.pool, this.tokenHolder, amountToReturn);
        });
      });
    });

    context("when pool has insufficient balance", function () {
      it("reverts", async function () {
        const poolBalance = await this.redeployedContracts.debtToken.balanceOf(this.pool);
        const amountToReturn = poolBalance + 1n;

        await expect(
          this.redeployedContracts.debtToken
            .connect(this.caller)
            .returnFromPool(this.pool, this.tokenHolder, amountToReturn)
        ).to.be.revertedWithCustomError(
          this.redeployedContracts.debtToken,
          "ERC20InsufficientBalance"
        );
      });
    });
  }
}
