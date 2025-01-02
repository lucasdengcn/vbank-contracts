import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from "ethers";

import BankTrustForwarderModule from './BankTrustForwarderModule';

const TermVault01UUPSModule = buildModule("TermVault01UUPSModule", (m) => {
    // gt the deployer, owner
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);
    // implementation trustedForwarder
    const { trustedForwarderProxy } = m.useModule(BankTrustForwarderModule);
    // implementation contract
    const implementation = m.contract("TermVault01", [trustedForwarderProxy], { from: deployer });
    // deploy UUPS Contract with implmentation
    /*
    address initialOwner,
        address _tokenAddress,
        string calldata _assetName,
        uint256 _minTerm,
        uint256 _interestRate
    */
    const _tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const _assetName = "FLIP";
    const _minTerm = 30;
    const _interestRate = 5;
    const initialize = m.encodeFunctionCall(implementation, "initialize", [owner, _tokenAddress, _assetName, _minTerm, _interestRate]);
    const termVault01Proxy = m.contract("ERC1967Proxy", [implementation, initialize], { from: deployer });
    //
    return { termVault01Proxy, trustedForwarderProxy };
});

const TermVault01Module = buildModule("TermVault01Module", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { termVault01Proxy, trustedForwarderProxy } = m.useModule(TermVault01UUPSModule);
    // get contract instance (proxy)
    const termVault01 = m.contractAt("TermVault01", termVault01Proxy);
    //
    return { termVault01, termVault01Proxy, trustedForwarderProxy };
});

export default TermVault01Module;