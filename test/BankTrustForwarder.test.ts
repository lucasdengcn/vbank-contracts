import { ethers, ignition } from "hardhat";
import { expect, version } from "chai";

import BankTrustForwarderModule from "../ignition/modules/BankTrustForwarderModule";

describe("BankTrustForwarderModule", function () {

    async function deploy() {
        const { trustedForwarder } = await ignition.deploy(BankTrustForwarderModule);
        return trustedForwarder;
    }

    it("Should deploy successfully", async function () {
        let fowarder1 = await deploy();
        expect(await fowarder1.getAddress()).to.be.properAddress;
    });
});
