# Deployment summary

## Verify deployment scripts

To verify deployment scripts run the following command:

```bash
yarn deploy
```

It will run the deployment scripts against a local network.

## Deploy to a network

```bash
yarn deploy:network <network>
```

Where `<network>` is the name of the network to deploy to

## Configuration

- [Networks Configuration](../config/networks.ts)
- [Collaterals Configuration](../config/collaterals.ts)
- [Named Accounts Configuration](../hardhat.config.ts#L94)
