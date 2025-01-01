import { ethers, ignition } from "hardhat";
import { expect, version } from "chai";

import BankAppUUPSModule from "../ignition/modules/BankAppUUPSModule";

import { Signer } from "ethers";

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

describe("BankApp", function () {
    let accounts: Signer[];
    let owner: Signer;
    //
    before(async function () {
        accounts = await ethers.getSigners();
        owner = accounts[1];
        const { bankApp, bankAppProxy, token, tokenProxy } = await ignition.deploy(BankAppUUPSModule);
        expect(await bankApp.getAddress()).to.equal(await bankAppProxy.getAddress());
        expect(await token.getAddress()).to.equal(await tokenProxy.getAddress());
        //
        this.bankApp = bankApp;
        this.token = token;
        //
        expect(await bankApp.owner()).to.equal(await accounts[1].getAddress());
        expect(await bankApp.version()).to.equal("1.0.0");
        expect(await bankApp.bankTokenAddress()).to.equal(await token.getAddress());
        //
        // console.log("BankApp:", await bankApp.getAddress(), "Token:", await token.getAddress(), "TokenProxy:", await tokenProxy.getAddress());
        const tokenBalance = await token.balanceOf(await owner.getAddress());
        console.log("Token Balance:", tokenBalance.toString(), await owner.getAddress());
        console.log("BankApp Balance:", await token.balanceOf(await bankApp.getAddress()));
    });

    describe("Wallet Binding", function () {

        it("Should bind wallet successfully", async function () {
            const wallet = ethers.Wallet.createRandom();
            // console.log(wallet);
            const name = "Ethers";
            const accountId = "1";
            await expect(this.bankApp.bindWallet(name, accountId, wallet.address))
                .to.emit(this.bankApp, "WalletBinded")
                .withArgs(wallet.address, accountId, name);
        });

        it("Should delete wallet successfully", async function () {
            const accountId = "1";
            const wallet = await this.bankApp.getWallet(accountId);
            await expect(this.bankApp.deleteWallet(accountId))
                .to.emit(this.bankApp, "WalletDeleted")
                .withArgs(wallet.addr, accountId, wallet.name);
        });

        it("Should return zero address given non-exist wallet", async function () {
            const accountId = "011111";
            const wallet = await this.bankApp.getWallet(accountId);
            expect(wallet.addr).to.be.equal(ethers.ZeroAddress);
        });

    });

    describe("Wallet Exchange", function () {
        it("Prepare BankApp token balance", async function () {
            // transfer tokens to BankApp address for exchange.
            const amount = ethers.parseEther("1000");
            await expect(this.token.connect(owner).transfer(await this.bankApp.getAddress(), amount))
                .emit(this.token, "Transfer")
                .withArgs(await owner.getAddress(), await this.bankApp.getAddress(), amount);
        });
        it("Prepare a wallet successfully", async function () {
            const accountId = "101";
            const wallet = accounts[2]; // signer
            const walletAddress = await wallet.getAddress();
            //
            await expect(this.bankApp.bindWallet("Ethers", accountId, walletAddress))
                .to.emit(this.bankApp, "WalletBinded")
                .withArgs(walletAddress, accountId, "Ethers");
            //
        });
        //
        it("Should transfer wallet to bank successfully", async function () {
            const wallet = accounts[2]; // signer
            const walletAddress = await wallet.getAddress();
            // const balance = await ethers.provider.getBalance(walletAddress);
            const receiverAddress = await this.bankApp.getAddress();
            const amount = ethers.parseEther("100");
            // will trigger receive function
            const tx = await wallet.sendTransaction({ to: receiverAddress, value: amount });
            expect(tx)
                .emit(this.bankApp, "BankReceived")
                .withArgs(walletAddress, receiverAddress, amount);
            // verify balance
            expect(await this.bankApp.getBalance(walletAddress)).to.equal(amount);
            //
            expect(await this.token.balanceOf(walletAddress)).to.equal(0);
        });
        //
        it("Should Wallet exchange token successfully", async function () {
            const wallet = accounts[2]; // signer
            const walletAddress = await wallet.getAddress();
            const sourceAddress = await this.bankApp.getAddress();
            // exchange 10 ethers to token
            const amount = ethers.parseEther("10");
            const walletBalance = await this.bankApp.getBalance(walletAddress);
            const sourceBalance = await this.token.balanceOf(sourceAddress);
            //
            const tx = await this.bankApp.connect(wallet).exchangeTokens(amount);
            // console.log(tx);
            // transfer token to bank
            expect(tx, "Token Exchange")
                .emit(this.bankApp, "TokenExchanged")
                .withArgs(sourceAddress, walletAddress, amount);
            // verify balance
            expect(await this.bankApp.getBalance(walletAddress), "Wallet Balance").to.equal(walletBalance - amount);
            expect(await this.token.balanceOf(walletAddress), "Token Balance").to.equal(amount);
            expect(await this.token.balanceOf(sourceAddress), "BankApp Balance").to.equal(sourceBalance - amount);
        });
        it("Should Wallet withdraw token successfully", async function () {
            const wallet = accounts[2]; // signer
            const walletAddress = await wallet.getAddress();
            const sourceAddress = await this.bankApp.getAddress();
            // withdraw 5 bank tokens
            const amount = ethers.parseEther("5");
            const walletBalance = await this.bankApp.getBalance(walletAddress);
            const bankSourceBalance = await this.token.balanceOf(sourceAddress);
            const userTokenBalance = await this.token.balanceOf(walletAddress);
            // prepare Inputs
            const { deadline, sign } = await getPermitSignature(walletAddress, sourceAddress, amount, wallet, this.token);
            //
            const tx = await this.bankApp.connect(wallet).withdrawTokens(amount, deadline, sign.v, sign.r, sign.s);
            // console.log(tx);
            // transfer token to bank
            expect(tx, "Token Withdraw")
                .emit(this.bankApp, "TokenWithdraw")
                .withArgs(walletAddress, sourceAddress, amount);
            // verify balance
            let amountUpdated = await this.bankApp.getBalance(walletAddress);
            //console.log(" Wallet Balance:", amountUpdated);
            expect(amountUpdated, "Wallet Balance").to.equal(walletBalance + amount);
            //
            amountUpdated = await this.token.balanceOf(walletAddress);
            //console.log("  Token Balance:", amountUpdated);
            expect(amountUpdated, "Token Balance").to.equal(userTokenBalance - amount);
            //
            amountUpdated = await this.token.balanceOf(sourceAddress);
            //console.log("BankApp Balance:", amountUpdated);
            expect(amountUpdated, "BankApp Balance").to.equal(bankSourceBalance + amount);
        });
        it("Should Withdraw wallet balance successfully", async function () {
            const wallet = accounts[2];
            const walletAddress = await wallet.getAddress();
            // states
            const walletBalance = await this.bankApp.getBalance(walletAddress);
            const userBalance = await ethers.provider.getBalance(walletAddress);
            // execution
            const amount = ethers.parseEther("10");
            const tx = await this.bankApp.connect(wallet).withdrawWallet(amount);
            // console.log(tx);
            // verify
            expect(tx, "Wallet Withdraw")
                .emit(walletAddress, "Transfer")
                .withArgs(walletAddress, amount);
            // verify balance
            let amountUpdated = await this.bankApp.getBalance(walletAddress);
            expect(amount, "Wallet Balance Change").to.equal(walletBalance - amountUpdated);
            //
            amountUpdated = await ethers.provider.getBalance(walletAddress);
            const offset = amountUpdated - userBalance;
            // console.log("User Balance:", ethers.formatEther(userBalance), ethers.formatEther(amountUpdated), ethers.formatEther(offset), ethers.formatEther(tx.gasPrice));
            // there will be some gas fee, so the amount will be less than the original amount.
            expect(amount, "User Balance Change").to.above(offset);
        });
    });

});

async function getPermitSignature(walletAddress: string, sourceAddress: any, amount: bigint, wallet: Signer, token: any) {
    // how long will the signature be valid. in 10 minutes
    const deadline = toDeadline(1000 * 60 * 10);
    const permitTypes = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };
    const permitValues = {
        owner: walletAddress,
        spender: sourceAddress,
        value: amount,
        nonce: await token.nonces(walletAddress),
        deadline: deadline
    };
    // get chain id
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const domain = {
        name: await token.name(),
        version: "1",
        chainId: chainId,
        verifyingContract: await token.getAddress()
    };
    // generate signature
    const signature = await wallet.signTypedData(domain, permitTypes, permitValues);
    const sign = ethers.Signature.from(signature);
    return { deadline, sign };
}
