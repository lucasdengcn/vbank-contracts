import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from "ethers";

const BankTrustForwarderUUPSModule = buildModule("BankTrustForwarderUUPSModule", (m) => {
    // gt the deployer, owner
    const deployer = m.getAccount(0);
    const owner = m.getAccount(1);
    // implementation contract
    const implementation = m.contract("BankTrustForwarder", [], { from: deployer });
    //
    const initialize = m.encodeFunctionCall(implementation, "initializeForwarder", [owner, "BankTrustForwarder"]);
    const trustedForwarderProxy = m.contract("ERC1967Proxy", [implementation, initialize], { from: deployer });
    //
    return { trustedForwarderProxy };
});

const BankTrustForwarderModule = buildModule("BankTrustForwarderModule", (m) => {
    // ensure proxy contract deployed before to upgrade it.
    const { trustedForwarderProxy } = m.useModule(BankTrustForwarderUUPSModule);
    // get contract instance (proxy)
    const trustedForwarder = m.contractAt("BankTrustForwarder", trustedForwarderProxy);
    //
    return { trustedForwarder, trustedForwarderProxy };
});

export default BankTrustForwarderModule;