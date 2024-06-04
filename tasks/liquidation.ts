import { task, types } from "hardhat/config";

task("liquidation", "Starts liquidation on a given collateral")
    .addParam('asset', 'The address of collateral asset', '', types.string)
    .addParam('num', 'The maximum number of under-collateralized TrenBoxes', 1, types.int)
    .setAction(async ( { asset, num }, { deployments, ethers } ) => {
        try {
            const deployment = await deployments.get("TrenBoxManagerOperations");
            const trenBoxManagerOperations = await ethers.getContractAt(
                "TrenBoxManagerOperations",
                deployment.address
            );

            const liquidationTx = await trenBoxManagerOperations.liquidateTrenBoxes(
                asset, num
            );
            await liquidationTx.wait();
        } catch (err) {
            console.log(err);
        }
    });
