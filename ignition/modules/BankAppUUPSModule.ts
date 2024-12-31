import {buildModule} from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from "ethers";

import BankTokenUUPSModule from './BankTokenUUPSModule';

const BankAppUUPSModule = buildModule("BankAppUUPSModule", (m) => {
    // gt the deployer, owner
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);
    // implementation contract
    const implementation = m.contract("BankApp", [], { from: deployer });
    // deploy Proxy Contract with implmentation
    const { token, tokenProxy } = m.useModule(BankTokenUUPSModule);
    // call initialize after deploy proxy and implementation.
    const initialize = m.encodeFunctionCall(implementation, "initialize", [owner, token.address]);
    const bankAppProxy = m.contract("ERC1967Proxy", [implementation, initialize]);
    //
    return { bankAppProxy, tokenProxy, token };
});

const BankAppModule = buildModule("BankAppModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { bankAppProxy, tokenProxy, token } = m.useModule(BankAppUUPSModule);
    // get contract instance (proxy)
    const bankApp = m.contractAt("BankApp", bankAppProxy);
    //
    return { bankApp, bankAppProxy, tokenProxy, token };
});

export default BankAppModule;
