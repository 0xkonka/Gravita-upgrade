import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetIndices(): void {
  context("for single collateral", function () {
    context("for active collateral", function () {
      it("should return correct collateral index", async function () {
        const { wETH } = this.collaterals.active;
        const expectedIndex = await this.contracts.adminContract.getIndex(wETH.address);

        const collateralIndices = await this.contracts.adminContract.getIndices([wETH.address]);

        expect(collateralIndices).to.be.have.lengthOf(1);
        expect(collateralIndices[0]).to.be.equal(expectedIndex);
      });
    });

    context("for inactive collateral", function () {
      it("should return correct collateral index", async function () {
        const { dai } = this.collaterals.inactive;
        const expectedIndex = await this.contracts.adminContract.getIndex(dai.address);

        const collateralIndices = await this.contracts.adminContract.getIndices([dai.address]);

        expect(collateralIndices).to.be.have.lengthOf(1);
        expect(collateralIndices[0]).to.be.equal(expectedIndex);
      });
    });

    context("for non-existent collateral", function () {
      it("should revert", async function () {
        const nonExistentCollateral = ethers.ZeroAddress;

        await expect(
          this.contracts.adminContract.getIndices([nonExistentCollateral])
        ).to.be.revertedWith("collateral does not exist");
      });
    });
  });

  context("for multiple collaterals", function () {
    context("for active and inactive collaterals", function () {
      it("should return correct collateral indices", async function () {
        const { wETH } = this.collaterals.active;
        const { dai } = this.collaterals.inactive;

        const expectedIndices = [
          await this.contracts.adminContract.getIndex(wETH.address),
          await this.contracts.adminContract.getIndex(dai.address),
        ];

        const collateralIndices = await this.contracts.adminContract.getIndices([
          wETH.address,
          dai.address,
        ]);

        expect(collateralIndices).to.be.have.lengthOf(2);
        expect(collateralIndices[0]).to.be.equal(expectedIndices[0]);
        expect(collateralIndices[1]).to.be.equal(expectedIndices[1]);
      });
    });

    context("for non-existent collateral", function () {
      it("should revert", async function () {
        const { wETH } = this.collaterals.active;
        const nonExistentCollateral = ethers.ZeroAddress;

        await expect(
          this.contracts.adminContract.getIndices([wETH.address, nonExistentCollateral])
        ).to.be.revertedWith("collateral does not exist");
      });
    });

    context("for active and non-existent collaterals", function () {
      it("should revert", async function () {
        const { wETH } = this.collaterals.active;
        const nonExistentCollateral = ethers.ZeroAddress;

        await expect(
          this.contracts.adminContract.getIndices([wETH.address, nonExistentCollateral])
        ).to.be.revertedWith("collateral does not exist");
      });
    });

    context("for duplicate collaterals", function () {
      it("should return correct collateral indices", async function () {
        const { wETH } = this.collaterals.active;

        const expectedIndex = await this.contracts.adminContract.getIndex(wETH.address);

        const collateralIndices = await this.contracts.adminContract.getIndices([
          wETH.address,
          wETH.address,
        ]);

        expect(collateralIndices).to.be.have.lengthOf(2);
        expect(collateralIndices[0]).to.be.equal(expectedIndex);
        expect(collateralIndices[1]).to.be.equal(expectedIndex);
      });
    });
  });
}
