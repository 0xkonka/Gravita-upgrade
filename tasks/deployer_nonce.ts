import { task } from "hardhat/config";
import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";

task("deployer_nonce", "returns nonce and balance for specified address on multiple networks")
  .addParam("address")
  .setAction(async address => {
    const API_URL_SEPOLIA = "https://eth-sepolia.g.alchemy.com/v2/W11DQwj4vGH8BrtxVJWuIQY4pHW8f4Oo";
    const API_URL_MUMBAI = "";
    const API_URL_ARBITRUM_SEPOLIA = "";
    const API_URL_OPTIMISM_SEPOLIA = "";

    const sepolia: AlchemyWeb3 = createAlchemyWeb3(API_URL_SEPOLIA);
    const mumbai: AlchemyWeb3 = createAlchemyWeb3(API_URL_MUMBAI);
    const arbitrum: AlchemyWeb3 = createAlchemyWeb3(API_URL_ARBITRUM_SEPOLIA);
    const optimism: AlchemyWeb3 = createAlchemyWeb3(API_URL_OPTIMISM_SEPOLIA);

    const networkIDs: string[] = ["Ethereum Sepolia:", "Polygon  Mumbai:", "Arbitrum Sepolia:", "Optimism Sepolia:"]
    const providers: AlchemyWeb3[] = [sepolia, mumbai, arbitrum, optimism];
    const results: any[] = [];
    
    for (let i = 0; i < providers.length; i++) {
      const nonce = await providers[i].eth.getTransactionCount(address.address, "latest");
      const balance = await providers[i].eth.getBalance(address.address)
      results.push([networkIDs[i], nonce, parseFloat(providers[i].utils.fromWei(balance, "ether")).toFixed(2) + "ETH"]);
    }
    results.unshift(["  |NETWORK|   |NONCE|   |BALANCE|  "])
    console.log(results);
  });

// 0x19E733F20aAdaB8996f7895ACBD04f746BF4Aac1

//   [
//     [ '  |NETWORK|   |NONCE|   |BALANCE|  ' ],
//     [ 'Ethereum Sepolia:', 245, '8.09ETH' ],
//     [ 'Polygon  Mumbai:', 0, '0.00ETH' ],
//     [ 'Arbitrum Sepolia:', 0, '0.00ETH' ],
//     [ 'Optimism Sepolia:', 0, '0.00ETH' ]
//   ]