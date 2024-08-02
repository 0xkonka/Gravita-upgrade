import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanBurn(): void {
  beforeEach(async function () {
    this.impostor = this.signers.accounts[1];

    this.borrowerOperationsImpostor = this.signers.accounts[2];
    this.stabilityPoolImpostor = this.signers.accounts[3];
    this.trenBoxManagerImpostor = this.signers.accounts[4];

    this.collateral = this.collaterals.active.wETH;
    this.tokenRecipient = this.signers.accounts[2];
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;

      await this.redeployedContracts.debtToken.setAddresses(
        this.borrowerOperationsImpostor.address,
        await this.contracts.stabilityPool.getAddress(),
        await this.contracts.trenBoxManager.getAddress()
      );

      this.impostor = this.borrowerOperationsImpostor;

      await this.redeployedContracts.debtToken
        .connect(this.impostor)
        .mint(this.collateral.address, this.tokenRecipient.address, 100);
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;

      await this.redeployedContracts.debtToken.setAddresses(
        this.borrowerOperationsImpostor.address,
        await this.contracts.stabilityPool.getAddress(),
        this.trenBoxManagerImpostor.address
      );

      await this.redeployedContracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.collateral.address, this.tokenRecipient.address, 100);

      this.impostor = this.trenBoxManagerImpostor;
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      const owner = this.signers.deployer;

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      this.redeployedContracts.debtToken = debtToken;

      await this.redeployedContracts.debtToken.setAddresses(
        this.borrowerOperationsImpostor.address,
        this.stabilityPoolImpostor.address,
        await this.contracts.trenBoxManager.getAddress()
      );

      await this.redeployedContracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.collateral.address, this.tokenRecipient.address, 100);

      this.impostor = this.stabilityPoolImpostor;
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context(
    "when caller is not borrower operations, tren box manager, or stability pool",
    function () {
      it("reverts", async function () {
        const amountToBurn = 50n;

        await expect(
          this.contracts.debtToken
            .connect(this.impostor)
            .burn(this.tokenRecipient.address, amountToBurn)
        ).to.be.revertedWithCustomError(this.contracts.debtToken, "DebtToken__CannotBurnTokens");
      });
    }
  );
}

function shouldBehaveLikeCanBurnCorrectly() {
  it("burns tokens from account", async function () {
    const amountToBurn = 50n;

    const initialBalance = await this.redeployedContracts.debtToken.balanceOf(
      this.tokenRecipient.address
    );

    await this.redeployedContracts.debtToken
      .connect(this.impostor)
      .burn(this.tokenRecipient.address, amountToBurn);

    const debtTokenBalance = await this.redeployedContracts.debtToken.balanceOf(
      this.tokenRecipient.address
    );

    expect(debtTokenBalance).to.be.equal(initialBalance - amountToBurn);
  });

  it("emits a Transfer event", async function () {
    const amountToBurn = 50n;

    await expect(
      this.redeployedContracts.debtToken
        .connect(this.impostor)
        .burn(this.tokenRecipient.address, amountToBurn)
    )
      .to.emit(this.redeployedContracts.debtToken, "Transfer")
      .withArgs(this.tokenRecipient.address, ethers.ZeroAddress, amountToBurn);
  });

  it("reduce total supply", async function () {
    const amountToBurn = 50n;
    const initialTotalSupply = await this.redeployedContracts.debtToken.totalSupply();

    await this.redeployedContracts.debtToken
      .connect(this.impostor)
      .burn(this.tokenRecipient.address, amountToBurn);

    const totalSupply = await this.redeployedContracts.debtToken.totalSupply();

    expect(totalSupply).to.be.equal(initialTotalSupply - amountToBurn);
  });
}
