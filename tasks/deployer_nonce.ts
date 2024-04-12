import { task } from "hardhat/config";
import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";

task("deployer_nonce", "returns nonce and balance for specified address on multiple networks")
  .addParam("address")
  .setAction(async address => {
    const API_URL_SEPOLIA = "https://eth-sepolia.g.alchemy.com/v2/W11DQwj4vGH8BrtxVJWuIQY4pHW8f4Oo";
    const API_URL_MUMBAI = "https://polygon-mumbai.g.alchemy.com/v2/sQWuxbaPon3KJp93ytOJmMvBX4nU3zdL";
    const API_URL_ARBITRUM_SEPOLIA = "https://arb-sepolia.g.alchemy.com/v2/r4zEUCE4-eTce0XpGGXGyVY0qV7SQb6V";
    const API_URL_OPTIMISM_SEPOLIA = "https://opt-sepolia.g.alchemy.com/v2/dXokXHeIHPrJ5dx5sLEofThi-TcR0kpJ";

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

// [
//   [ '  |NETWORK|   |NONCE|   |BALANCE|  ' ],
//   [ 'Ethereum Sepolia:', 0, '0.00ETH' ],
//   [ 'Polygon  Mumbai:', 0, '0.00ETH' ],
//   [ 'Arbitrum Sepolia:', 0, '0.00ETH' ],
//   [ 'Optimism Sepolia:', 0, '0.00ETH' ]
// ]