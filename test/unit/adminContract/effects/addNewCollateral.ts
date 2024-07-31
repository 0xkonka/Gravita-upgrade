import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanAddNewCollateral(): void {
  context("when adding a new collateral", function () {
    it("should emit CollateralAdded", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const addNewCollateralTx = await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const expectedAddress = testCollateral.address.toString();

      await expect(addNewCollateralTx)
        .to.emit(this.contracts.adminContract, "CollateralAdded")
        .withArgs(expectedAddress);
    });

    it("should add new collateral to validCollaterals", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const validCollaterals = await this.contracts.adminContract.getValidCollateral();

      expect(validCollaterals).to.include(testCollateral.address);
    });

    it("should set correct index", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const expectedIndex = (await this.contracts.adminContract.getValidCollateral()).length;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const index = await this.contracts.adminContract.getIndex(testCollateral.address);

      expect(index).to.be.equal(expectedIndex);
    });

    it("should set correct gas compensation", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const gasCompensation = await this.contracts.adminContract.getDebtTokenGasCompensation(
        testCollateral.address
      );

      expect(gasCompensation).to.be.equal(testCollateral.gasCompensation);
    });

    it("should leave active flag as false", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const isActive = await this.contracts.adminContract.getIsActive(testCollateral.address);

      expect(isActive).to.be.false;
    });

    it("should set borrowingFee to BORROWING_FEE_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(
        testCollateral.address
      );
      const borrowingFeeDefault = await this.contracts.adminContract.BORROWING_FEE_DEFAULT();

      expect(borrowingFee).to.be.equal(borrowingFeeDefault);
    });

    it("should set CCR to CCR_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const CCR = await this.contracts.adminContract.getCcr(testCollateral.address);
      const CCRDefault = await this.contracts.adminContract.CCR_DEFAULT();

      expect(CCR).to.be.equal(CCRDefault);
    });

    it("should set MCR to MCR_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const MCR = await this.contracts.adminContract.getMcr(testCollateral.address);
      const MCRDefault = await this.contracts.adminContract.MCR_DEFAULT();

      expect(MCR).to.be.equal(MCRDefault);
    });

    it("should set minNetDebt to MIN_NET_DEBT_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(testCollateral.address);
      const minNetDebtDefault = await this.contracts.adminContract.MIN_NET_DEBT_DEFAULT();

      expect(minNetDebt).to.be.equal(minNetDebtDefault);
    });

    it("should set mintCap to MINT_CAP_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const mintCap = await this.contracts.adminContract.getMintCap(testCollateral.address);
      const mintCapDefault = await this.contracts.adminContract.MINT_CAP_DEFAULT();

      expect(mintCap).to.be.equal(mintCapDefault);
    });

    it("should set percentDivisor to PERCENT_DIVISOR_DEFAULT", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(
        testCollateral.address
      );
      const percentDivisorDefault = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      expect(percentDivisor).to.be.equal(percentDivisorDefault);
    });

    it("should add collateral to StabilityPool", async function () {
      const { testCollateral } = this.collaterals.notAdded;
      await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      const [tokensInStabilityPool] = await this.contracts.stabilityPool.getAllCollateral();

      expect(tokensInStabilityPool).to.include(testCollateral.address);
    });
  });

  context("when adding an existing collateral", function () {
    it("should revert", async function () {
      const { wETH } = this.collaterals.active;

      await expect(
        this.contracts.adminContract.addNewCollateral(wETH.address, wETH.gasCompensation)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralExists"
      );
    });
  });

  context("when adding a collateral with zero address", function () {
    it.skip("should revert", async function () {
      const zeroAddress = ethers.ZeroAddress;

      await expect(
        this.contracts.adminContract.addNewCollateral(zeroAddress, 0)
      ).to.be.revertedWith("invalid address");
    });
  });

  context("when not owner calls addNewCollateral", function () {
    it("should revert", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.adminContract
          .connect(notOwner)
          .addNewCollateral(testCollateral.address, testCollateral.gasCompensation)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });
}
