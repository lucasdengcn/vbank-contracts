import { ethers, ignition } from "hardhat";
import { expect, version } from "chai";

import TermVault01UUPSModule from "../ignition/modules/TermVault01UUPSModule";

describe("BankTrustForwarderModule", function () {

    it("Should deploy successfully", async function () {
        const { termVault01, termVault01Proxy, trustedForwarderProxy } = await ignition.deploy(TermVault01UUPSModule);
        expect(await termVault01.getAddress()).to.be.properAddress;
        console.log("termVault01Proxy:", await termVault01Proxy.getAddress());
        console.log("trustedForwarderProxy:", await trustedForwarderProxy.getAddress());
        console.log("termVault01:", await termVault01.getAddress());
    });
});
