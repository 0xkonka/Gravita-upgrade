import { ethers } from "ethers";
import { task } from "hardhat/config";
import fs from 'fs';
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import chalk from "chalk";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

task("check-nonce", "returns nonce and balance for specified address on multiple networks")
  .setAction(async ({ address }: { address: string }, { ethers }) => {
    address = process.env.DEPLOYER_ADDRESS as string;

    if (address === "") {
      throw new Error("Deployer address not provided. Add address in .env file.");
    }

    const providerUrls: Record<string, string> = {
      ETH_Sepolia: "https://eth-sepolia.g.alchemy.com/v2/W11DQwj4vGH8BrtxVJWuIQY4pHW8f4Oo",
      // PolygonMumbai: "https://polygon-mumbai.g.alchemy.com/v2/sQWuxbaPon3KJp93ytOJmMvBX4nU3zdL",
      ARB_Sepolia: "https://arb-sepolia.g.alchemy.com/v2/r4zEUCE4-eTce0XpGGXGyVY0qV7SQb6V",
      OP_Sepolia: "https://opt-sepolia.g.alchemy.com/v2/dXokXHeIHPrJ5dx5sLEofThi-TcR0kpJ",
    };

    const nonces: Record<string, number> = {};

    const providerNames: string[] = Object.keys(providerUrls);
    const providerObjects: ethers.JsonRpcProvider[] = providerNames.map(
      (providerName) => new ethers.JsonRpcProvider(providerUrls[providerName])
    );

    const results = await Promise.all(
      providerObjects.map(async (provider, index) => {
        const nonce = await provider.getTransactionCount(address, "latest");
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        
        nonces[providerNames[index]] = nonce;
    
        return {
          network: providerNames[index],
          nonce: nonce,
          balance: formattedBalance + " ETH"
        };
      })
    );

    fs.writeFileSync('deployer_nonce.json', JSON.stringify(results, null, 2));

    const noncesValues = Object.values(nonces);
    const isConsistent = noncesValues.every((val, i, arr) => val === arr[0]);

    if (isConsistent) {
      console.log(`Nonces match across all networks. ${chalk.green("You can proceed deployment.")}`);
    } else {
      console.log(`Nonces do not match across all networks. ${chalk.red("Stop deployment.")}`);
      throw new Error('Nonces do not match across all networks.');
    }  
  });