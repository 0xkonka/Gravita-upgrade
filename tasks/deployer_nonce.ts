import { ethers } from "ethers";
import { task } from "hardhat/config";
import fs from 'fs'; // Import file system module

task("deployer_nonce", "returns nonce and balance for specified address on multiple networks")
  .addParam("address", "The address for which to fetch nonce and balance")
  .setAction(async ({ address }: { address: string }, { ethers }) => {
    const providerUrls: Record<string, string> = {
      ETH_Sepolia: "https://eth-sepolia.g.alchemy.com/v2/W11DQwj4vGH8BrtxVJWuIQY4pHW8f4Oo",
      // PolygonMumbai: "https://polygon-mumbai.g.alchemy.com/v2/sQWuxbaPon3KJp93ytOJmMvBX4nU3zdL",
      ARB_Sepolia: "https://arb-sepolia.g.alchemy.com/v2/r4zEUCE4-eTce0XpGGXGyVY0qV7SQb6V",
      OP_Sepolia: "https://opt-sepolia.g.alchemy.com/v2/dXokXHeIHPrJ5dx5sLEofThi-TcR0kpJ",
    };

    const providerNames: string[] = Object.keys(providerUrls);
    const providerObjects: ethers.JsonRpcProvider[] = providerNames.map(
      (providerName) => new ethers.JsonRpcProvider(providerUrls[providerName])
    );

    const results = await Promise.all(
      providerObjects.map(async (provider, index) => {
        const nonce = await provider.getTransactionCount(address, "latest");
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        return {
          network: providerNames[index],
          nonce: nonce,
          balance: formattedBalance + " ETH"
        };
      })
    );

    fs.writeFileSync('deployer_nonce.json', JSON.stringify(results, null, 2));

    console.log("Results written to deployer_nonce.json");
  });
