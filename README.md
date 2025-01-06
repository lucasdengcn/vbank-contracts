# VBank Demo project

This project demo for application for VBank, issue FLIP token.

```shell
npx hardhat help
npx hardhat test
npx hardhat node
```

## Deploy to local

```shell
sh scripts/run-local-node.sh
```

```shell
sh scripts/deploy-local.sh
```

## Features

* Deposit asset from Wallet
* Exchange between asset with VBank token
* Withdraw asset to Wallet
* Add Liqudity

## Tech Stack

* Solidity
* OpenZepplin
* UUPS Upgrade
* EPC20 and SafeERC20
* ERC-3009
* EIP-712
* ERC-2612
* ERC-2771
* ReentrancyGuardUpgradeable
* Hardhat
* Create2

## Testing

* ethers.js
* typescript
