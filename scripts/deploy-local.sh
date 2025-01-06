npx hardhat clean && npx hardhat compile && npx hardhat export-abi

# deploy contracts
npx hardhat ignition deploy ./ignition/modules/BankAppUUPSModule.ts --network localhost --strategy create2

# deploy abi to frontend app
cp -fr artifacts/contracts/* ../banking-frontend/src/app/abi/contracts/
