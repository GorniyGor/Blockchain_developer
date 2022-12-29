const { ethers } = require("hardhat");
const { expect } = require("chai");
const { DAI, AAVE_POLYGON_POOL_PROVIDER, DAI_WHALE } = require("../constants/index.js")

describe("Deploy a Flash Loan", function() {
    it("Should take a flash loan and be able to return it", async function() {
        const FlashLoanExample = await ethers.getContractFactory("FlashLoanExample");

        const myFlashLoanContract = await FlashLoanExample.deploy(AAVE_POLYGON_POOL_PROVIDER);
        await myFlashLoanContract.deployed();

        const token = await ethers.getContractAt("IERC20", DAI);
        const BALANCE_AMOUNT_DAI = ethers.utils.parseEther("2000");

        // Topup our contract address from DAI_WHALE account to cover premium
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [DAI_WHALE],
        });
        const signer = await ethers.getSigner(DAI_WHALE);
        await token
          .connect(signer)
          .transfer(myFlashLoanContract.address, BALANCE_AMOUNT_DAI); // Sends our contract 2000 DAI from the DAI_WHALE

        const tx = await myFlashLoanContract.createFlashLoan(DAI, 1000); // Borrow 1000 DAI in a Flash Loan with no upfront collateral
        await tx.wait();
        const remainingBalance = await token.balanceOf(myFlashLoanContract.address); // Check the balance of DAI in the Flash Loan contract afterwards
        expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.equal(true); // We must have less than 2000 DAI now, since the premium was paid from our contract's balance
    });

});