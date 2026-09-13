# Nectar Subscriptions

`NectarSubscriptions` is the single subscription registry for Nectar.

- Network: Avalanche Fuji, chain ID `43113`
- Payment token: Fuji USDC, `0x5425890298aed601595a70AB815c96711a31Bc65`
- Duration: 30 days
- Split: 90% to the creator, 10% to the Nectar treasury
- Access: indexed from `SubscriptionPaid` events into Arkiv

## Setup

```sh
forge install foundry-rs/forge-std --no-git
forge install openzeppelin/openzeppelin-contracts --no-git
```

## Test

```sh
forge test
```

## Deploy

Set `DEPLOYER_PRIVATE_KEY` and `TREASURY_ADDRESS`, then run:

```sh
forge script script/Deploy.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast
```

The deployed Fuji registry is currently:

```text
0x57d208210336D6b372A521c3662fe2ca49B7F25c
```
