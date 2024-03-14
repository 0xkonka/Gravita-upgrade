import shouldBehaveLikeCanAddWhitelist from "./effects/addWhitelist";
import shouldBehaveLikeCanBurn from "./effects/burn";
import shouldBehaveLikeCanMint from "./effects/mint";
import shouldBehaveLikeCanRemoveWhitelist from "./effects/removeWhitelist";
import shouldBehaveLikeCanSendToPool from "./effects/sendToPool";
import shouldBehaveLikeCanSetAddresses from "./effects/setAddresses";
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

      describe("#mintFromWhitelistedContract", function () {});
      describe("#burnFromWhitelistedContract", function () {});

      describe("#emergencyStopMinting", function () {});

      describe("#sendToPool", function () {
        shouldBehaveLikeCanSendToPool();
      });

      describe("#returnFromPool", function () {});

      describe("#transfer", function () {});
      describe("#transferFrom", function () {});
      describe("#approve", function () {});
    });
  });
}
