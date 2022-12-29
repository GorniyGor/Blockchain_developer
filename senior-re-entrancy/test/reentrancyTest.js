const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { expect } = require("chai");

describe("Attack", function() {

    it("WHEN `call` is used THEN the good contract balance goes to Zero", async function() {
        // Deploy the good contract
        const goodContractFactory = await ethers.getContractFactory("GoodContract");
        const goodContract = await goodContractFactory.deploy();
        await goodContract.deployed();

        //Deploy the bad contract
        const badContractFactory = await ethers.getContractFactory("BadContract");
        const badContract = await badContractFactory.deploy(goodContract.address);
        await badContract.deployed();

        // Get two addresses, treat one as innocent user and one as attacker
        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();

        // Innocent User deposits 10 ETH into GoodContract
        let tx = await goodContract.connect(innocentAddress).addBalance({
          value: parseEther("10"),
        });
        await tx.wait();

        // Check that at this point the GoodContract's balance is 10 ETH
        let balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(parseEther("10"));

        // Attacker calls the `attack` function on BadContract
        // and sends 1 ETH
        tx = await badContract.connect(attackerAddress).attack({
          value: parseEther("1"),
        });
        await tx.wait();

        // Balance of the GoodContract's address is now zero
        balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(parseEther("0"));

        // Balance of BadContract is now 11 ETH (10 ETH stolen + 1 ETH from attacker)
        balanceETH = await ethers.provider.getBalance(badContract.address);
        expect(balanceETH).to.equal(parseEther("11"));
    });

    it("WHEN `send` is used THEN attacker's transaction is reverted", async function() {
        // Deploy the good contract
        const goodContractFactory = await ethers.getContractFactory("GoodContract");
        const goodContract = await goodContractFactory.deploy();
        await goodContract.deployed();

        //Deploy the bad contract
        const badContractFactory = await ethers.getContractFactory("BadContract_Send");
        const badContract = await badContractFactory.deploy(goodContract.address);
        await badContract.deployed();

        // Get two addresses, treat one as innocent user and one as attacker
        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();

        // Innocent User deposits 10 ETH into GoodContract
        let tx = await goodContract.connect(innocentAddress).addBalance({
          value: parseEther("10"),
        });
        await tx.wait();

        // Check that at this point the GoodContract's balance is 10 ETH
        let balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(parseEther("10"));

        // Attacker calls the `attack` function on BadContract
        // and sends 1 ETH
        await expect(
            badContract.connect(attackerAddress).attack({
              value: parseEther("1"),
            })
        ).to.be.revertedWith("Failed to send ether")
        // Doesn't work because of `send` provides too small Gas that leads to `false` action result
    });

    it("WHEN `transfer` is used THEN attacker's transaction is reverted", async function() {
        // Deploy the good contract
        const goodContractFactory = await ethers.getContractFactory("GoodContract");
        const goodContract = await goodContractFactory.deploy();
        await goodContract.deployed();

        //Deploy the bad contract
        const badContractFactory = await ethers.getContractFactory("BadContract_Transfer");
        const badContract = await badContractFactory.deploy(goodContract.address);
        await badContract.deployed();

        // Get two addresses, treat one as innocent user and one as attacker
        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();

        // Innocent User deposits 10 ETH into GoodContract
        let tx = await goodContract.connect(innocentAddress).addBalance({
          value: parseEther("10"),
        });
        await tx.wait();

        // Check that at this point the GoodContract's balance is 10 ETH
        let balanceETH = await ethers.provider.getBalance(goodContract.address);
        expect(balanceETH).to.equal(parseEther("10"));

        // Attacker calls the `attack` function on BadContract
        // and sends 1 ETH
        await expect(
            badContract.connect(attackerAddress).attack({
              value: parseEther("1"),
            })
        ).to.be.revertedWithoutReason() //the call run out of gas actually
        // Doesn't work because of `transfer` provides too small Gas
    });
});