import {buildModule} from '@nomicfoundation/hardhat-ignition/modules' 
import { ethers } from "ethers";

const BankTokenUUPSModule = buildModule("BankTokenUUPSModule", (m) => {
    // gt the deployer, owner
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);
    const amount = ethers.parseEther("100000"); // 100,000 ETH
    // implementation contract
    const implementation = m.contract("BankToken", [], { from: deployer });
    // deploy Proxy Contract with implmentation
    // call initialize after deploy proxy and implementation.
    const initialize = m.encodeFunctionCall(implementation, "initialize", [owner, amount]);
    const tokenProxy = m.contract("ERC1967Proxy", [implementation, initialize]);
    //
    return { tokenProxy };
});

const BankTokenModule = buildModule("BankTokenModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { tokenProxy } = m.useModule(BankTokenUUPSModule);
    // get contract instance (proxy)
    const token = m.contractAt("BankToken", tokenProxy);
    return { token, tokenProxy };
});

export default BankTokenModule;
