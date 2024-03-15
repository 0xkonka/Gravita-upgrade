import shouldBehaveLikeCanAddWhitelist from "./effects/addWhitelist";
import shouldBehaveLikeCanApprove from "./effects/approve";
import shouldBehaveLikeCanBurn from "./effects/burn";
import shouldBehaveLikeCanBurnFromWhitelistedContract from "./effects/burnFromWhitelistedContract";
import shouldBehaveLikeHaveCanEmergencyStopMinting from "./effects/emergencyStopMinting";
import shouldBehaveLikeCanMint from "./effects/mint";
import shouldBehaveLikeCanMintFromWhitelistedContract from "./effects/mintFromWhitelistedContract";
import shouldBehaveLikeCanRemoveWhitelist from "./effects/removeWhitelist";
import shouldBehaveLikeCanReturnFromPool from "./effects/returnFromPool";
import shouldBehaveLikeCanSendToPool from "./effects/sendToPool";
import shouldBehaveLikeCanSetAddresses from "./effects/setAddresses";
import shouldBehaveLikeCanTransfer from "./effects/transfer";
import shouldBehaveLikeCanTransferFrom from "./effects/transferFrom";
import shouldBehaveLikeHaveBorrowerOperationsAddress from "./view/borrowerOperationsAddress";
import shouldBehaveLikeDecimals from "./view/constants/decimals";
import shouldBehaveLikeNamed from "./view/constants/name";
import shouldBehaveLikeSymbol from "./view/constants/symbol";
import shouldBehaveLikeHaveEmergencyStopMintingCollateral from "./view/emergencyStopMintingCollateral";
import shouldBehaveLikeOwner from "./view/owner";
import shouldBehaveLikeHaveStabilityPoolAddress from "./view/stabilityPoolAddress";
import shouldBehaveLikeHaveTrenBoxManagerAddress from "./view/trenBoxManagerAddress";
import shouldBehaveLikeHaveWhitelistedContracts from "./view/whitelistedContracts";

export function shouldBehaveLikeDebtTokenContract(): void {
  describe("DebtToken", function () {
    describe("View Functions", function () {
      describe("#NAME", function () {
        shouldBehaveLikeNamed();
      });
      describe("#SYMBOL", function () {
        shouldBehaveLikeSymbol();
      });

      describe("#decimals", function () {
        shouldBehaveLikeDecimals();
      });

      describe("#borrowerOperationsAddress", function () {
        shouldBehaveLikeHaveBorrowerOperationsAddress();
      });

      describe("#stabilityPoolAddress", function () {
        shouldBehaveLikeHaveStabilityPoolAddress();
      });

      describe("#trenBoxManagerAddress", function () {
        shouldBehaveLikeHaveTrenBoxManagerAddress();
      });

      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });

      describe("#emergencyStopMintingCollateral", function () {
        shouldBehaveLikeHaveEmergencyStopMintingCollateral();
      });

      describe("#whitelistedContracts", function () {
        shouldBehaveLikeHaveWhitelistedContracts();
      });
    });
    describe("Effects Functions", function () {
      describe("#setAddresses", function () {
        shouldBehaveLikeCanSetAddresses();
      });

      describe("#mint", function () {
        shouldBehaveLikeCanMint();
      });

      describe("#burn", function () {
        shouldBehaveLikeCanBurn();
      });

      describe("#addWhitelist", function () {
        shouldBehaveLikeCanAddWhitelist();
      });

      describe("#removeWhitelist", function () {
        shouldBehaveLikeCanRemoveWhitelist();
      });

      describe("#mintFromWhitelistedContract", function () {
        shouldBehaveLikeCanMintFromWhitelistedContract();
      });

      describe("#burnFromWhitelistedContract", function () {
        shouldBehaveLikeCanBurnFromWhitelistedContract();
      });

      describe("#emergencyStopMinting", function () {
        shouldBehaveLikeHaveCanEmergencyStopMinting();
      });

      describe("#sendToPool", function () {
        shouldBehaveLikeCanSendToPool();
      });

      describe("#returnFromPool", function () {
        shouldBehaveLikeCanReturnFromPool();
      });

      describe("#transfer", function () {
        shouldBehaveLikeCanTransfer();
      });

      describe("#approve", function () {
        shouldBehaveLikeCanApprove();
      });

      describe("#transferFrom", function () {
        shouldBehaveLikeCanTransferFrom();
      });
    });
  });
}
