# Slice

Slice is a P2P payment system built on top of Account Abstraction.

The code for this project was created during the ETH Glocal Lisbon 2023 Hackathon.

This project [won the Safe prize](https://twitter.com/safe/status/1657769388215500805?s=46) for best use case of the safe Core SDK.

## What is Slice ?

With Slice users can transfer money through Ethereum chain using only a credit card and their social account login (no browser extension).
Think Venmo or Cashapp, but decentralised and borderless.

The tech stack is built with [Safe Core SDK](https://docs.safe.global/learn/safe-core/safe-core-account-abstraction-sdk)

- Authentication : Web3auth
- Smart Account Wallet : Safe
- Fiat -> Crypto Onramp : Stripe
- Gasless transactions : Gelato

## Demo

[Click here](https://ethlisbon-vdaubry.vercel.app/) for the demo

## Account Abstraction

### Web3Auth

Web2 like authentication and account creation with Safe AuthKit. [source](https://github.com/vdaubry/ethlisbon/blob/master/frontend/components/Web3Auth.tsx#L59)

### Safe creation (gasless)

Create Smart Contract Wallet with safe ProtocolKit. [source](https://github.com/vdaubry/ethlisbon/blob/master/frontend/components/CreateSafe.tsx#L109)

Leverage RelayKit to use Gelato for sponsoring transactions. [source](https://github.com/vdaubry/ethlisbon/blob/master/frontend/components/CreateSafe.tsx#L85)

### Crypto on-ramp with FIAT

Leverage Safe OnrampKit for crypto onramp using Stripe [source](https://github.com/vdaubry/ethlisbon/blob/master/frontend/components/OnRamp.tsx#L15)

## Smart Contracts adresses

- Polygon [tweet](https://twitter.com/filmacedo/status/1657528792208777216)
  - Slice.sol => 0xc94650e4857da3d0ea612e079a8b3f7979e5f62a [Polygonscan](https://polygonscan.com/address/0xc94650e4857da3d0ea612e079a8b3f7979e5f62a)
  - Pay.sol => 0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b [Polygonscan](https://polygonscan.com/address/0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b)
- Gnosis
  - Slice.sol => 0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A [Gnosisscan](https://gnosisscan.io/address/0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A)
  - Pay.sol => 0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b [Gnosisscan](https://gnosisscan.io/address/0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b)
- Optimism
  - Slice.sol => 0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A [Gnosisscan](https://optimistic.etherscan.io/address/0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A)
  - Pay.sol => 0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b [Gnosisscan](https://optimistic.etherscan.io/address/0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b)
- Scroll
  - Slice.sol => 0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A [Blockscout Scroll](https://blockscout.scroll.io/address/0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A)
  - Pay.sol => 0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b [Blockscout Scroll](https://blockscout.scroll.io/address/0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b)
- Linea
  - Slice.sol => 0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A [Linea Explorer](https://explorer.goerli.linea.build/address/0xc94650e4857Da3d0ea612e079a8B3F7979e5F62A)
  - Slice.sol => 0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b [Linea Explorer](https://explorer.goerli.linea.build/address/0x3Da82bA30848AE6b36FCe965f48c2103efb7c38b)
- Goerli
  - Slice.sol => 0x0E367094A6a3FB43a9ba068824b1d75028eE364A [Goerli Etherscan](https://goerli.etherscan.io/address/0x0E367094A6a3FB43a9ba068824b1d75028eE364A)
  - Pay.sol => 0x5D05EAE2057Dc6cC36E3f79dA98365dEfD9489D5 [Goerli Etherscan](https://goerli.etherscan.io/address/0x5D05EAE2057Dc6cC36E3f79dA98365dEfD9489D5)
