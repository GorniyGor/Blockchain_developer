const { expect } = require("chai");
const { ethers } = require("hardhat");
const { arrayify, parseEther } = require("ethers/lib/utils");
const { BigNumber } = require("ethers");
const { MY_BOYS_DEVS_ADDRESS, MBD_HOLDER_ADDRESS } = require("../constants")
require("dotenv").config({ path: ".env" });

describe("MetaTokenTransfer", function () {

  it("GIVEN user approves token transfer by relayer\n" +
      "WHEN user signs a message of transfer tokens to receipient\n" +
      "THEN user transfers tokens through a relayer", async function () {

    const MyBoysDevsToken = await ethers.getContractAt("IERC20", MY_BOYS_DEVS_ADDRESS);

    const MetaTokenSenderFactory = await ethers.getContractFactory("TokenSender");
    const tokenSenderContract = await MetaTokenSenderFactory.deploy();
    await tokenSenderContract.deployed();

    const [_, relayerAddress, recipientAddress] = await ethers.getSigners();
    //Top up user with MBD tokens
    const userAddress = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider)

    const userTokenContractInstance = MyBoysDevsToken.connect(userAddress);

    // Have user infinite approve the token sender contract for transferring 'MyBoysDevs token'
    const approveTxn = await userTokenContractInstance.approve(
        tokenSenderContract.address,
        BigNumber.from(
            // This is uint256's max value (2^256 - 1) in hex
            // Fun Fact: There are 64 f's in here.
            // In hexadecimal, each digit can represent 4 bits
            // f is the largest digit in hexadecimal (1111 in binary)
            // 4 + 4 = 8 i.e. two hex digits = 1 byte
            // 64 digits = 32 bytes
            // 32 bytes = 256 bits = uint256
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
    );
    await approveTxn.wait();

    // Have user sign message to transfer 3 tokens to recipient
    const transferAmountOfTokens = parseEther("1");
    const messageHash = await tokenSenderContract.getHash(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address
    );
    const signature = await userAddress.signMessage(arrayify(messageHash));

    // Have the relayer execute the transaction on behalf of the user
    const relayerSenderContractInstance = tokenSenderContract.connect(relayerAddress);

    const userBalanceBefore = await MyBoysDevsToken.balanceOf(userAddress.address);

    console.log(`user balance BEFORE: ${userBalanceBefore}`);
    let metaTxn = await relayerSenderContractInstance.transfer(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        signature
    );
    await metaTxn.wait();

    // Check the user's balance decreased, and recipient got 10 tokens
    const userBalance = await MyBoysDevsToken.balanceOf(
        userAddress.address
    );
    const recipientBalance = await MyBoysDevsToken.balanceOf(
        recipientAddress.address
    );

    console.log(`user balance AFTER: ${userBalance}; recipient balance: ${recipientBalance}`);
    expect(userBalance.lt(userBalanceBefore)).to.be.true;
    expect(recipientBalance).to.be.equal(transferAmountOfTokens);
  });

  it("GIVEN user approves token transfer by relayer\n" +
      "WHEN user signs a message of transfer tokens to receipient\n" +
      "THEN user transfers more then user signed tokens through a relayer", async function () {

    const MyBoysDevsToken = await ethers.getContractAt("IERC20", MY_BOYS_DEVS_ADDRESS);

    const MetaTokenSenderFactory = await ethers.getContractFactory("TokenSender");
    const tokenSenderContract = await MetaTokenSenderFactory.deploy();
    await tokenSenderContract.deployed();

    const [_, relayerAddress, recipientAddress] = await ethers.getSigners();
    //Top up user with MBD tokens
    const userAddress = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider)


    const userTokenContractInstance = MyBoysDevsToken.connect(userAddress);

    // Have user infinite approve the token sender contract for transferring 'MyBoysDevs token'
    const approveTxn = await userTokenContractInstance.approve(
        tokenSenderContract.address,
        BigNumber.from(
            // This is uint256's max value (2^256 - 1) in hex
            // Fun Fact: There are 64 f's in here.
            // In hexadecimal, each digit can represent 4 bits
            // f is the largest digit in hexadecimal (1111 in binary)
            // 4 + 4 = 8 i.e. two hex digits = 1 byte
            // 64 digits = 32 bytes
            // 32 bytes = 256 bits = uint256
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
    );
    await approveTxn.wait();

    // Have user sign message to transfer 3 tokens to recipient
    const transferAmountOfTokens = parseEther("1");
    const messageHash = await tokenSenderContract.getHash(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address
    );
    const signature = await userAddress.signMessage(arrayify(messageHash));

    // Have the relayer execute the transaction on behalf of the user
    const relayerSenderContractInstance = tokenSenderContract.connect(relayerAddress);

    const userBalanceBefore = await MyBoysDevsToken.balanceOf(userAddress.address);

    console.log(`user balance BEFORE: ${userBalanceBefore}`);
    let metaTxn = await relayerSenderContractInstance.transfer(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        signature
    );
    await metaTxn.wait();
    //try one more time, although user sign 1 transfer
    metaTxn = await relayerSenderContractInstance.transfer(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        signature
    );
    await metaTxn.wait();


    // Check the user's balance decreased, and recipient got 10 tokens
    const userBalance = await MyBoysDevsToken.balanceOf(
        userAddress.address
    );
    const recipientBalance = await MyBoysDevsToken.balanceOf(
        recipientAddress.address
    );

    console.log(`user balance AFTER: ${userBalance}; recipient balance: ${recipientBalance}`);
    expect(userBalance.lt(userBalanceBefore)).to.be.true;
    expect(recipientBalance.gt(transferAmountOfTokens)).to.be.true;
  });

  it("GIVEN user approves token transfer by relayer\n" +
      "WHEN user signs a message of transfer tokens to receipient\n" +
      "THEN user transfers NO more then user signed tokens through a relayer", async function () {

    const MyBoysDevsToken = await ethers.getContractAt("IERC20", MY_BOYS_DEVS_ADDRESS);

    const MetaTokenSenderFactory = await ethers.getContractFactory("TokenSender");
    const tokenSenderContract = await MetaTokenSenderFactory.deploy();
    await tokenSenderContract.deployed();

    const [_, relayerAddress, recipientAddress] = await ethers.getSigners();
    //Top up user with MBD tokens
    const userAddress = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider)

    const userTokenContractInstance = MyBoysDevsToken.connect(userAddress);

    // Have user infinite approve the token sender contract for transferring 'MyBoysDevs token'
    const approveTxn = await userTokenContractInstance.approve(
        tokenSenderContract.address,
        BigNumber.from(
            // This is uint256's max value (2^256 - 1) in hex
            // Fun Fact: There are 64 f's in here.
            // In hexadecimal, each digit can represent 4 bits
            // f is the largest digit in hexadecimal (1111 in binary)
            // 4 + 4 = 8 i.e. two hex digits = 1 byte
            // 64 digits = 32 bytes
            // 32 bytes = 256 bits = uint256
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
    );
    await approveTxn.wait();

    // Have user sign message to transfer 3 tokens to recipient
    const transferAmountOfTokens = parseEther("1");
    let transferNumber = 1;
    const messageHash1 = await tokenSenderContract.getHashCorrected(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        transferNumber
    );
    const signature1 = await userAddress.signMessage(arrayify(messageHash1));

    // Have the relayer execute the transaction on behalf of the user
    const relayerSenderContractInstance = tokenSenderContract.connect(relayerAddress);

    const userBalanceBefore = await MyBoysDevsToken.balanceOf(userAddress.address);

    console.log(`user balance BEFORE: ${userBalanceBefore}`);
    let metaTxn = await relayerSenderContractInstance.transferCorrected(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        transferNumber,
        signature1,
    );
    await metaTxn.wait();
    //Try one more time, although user sign 1 transfer
    //and check txn cannot be repeated
    await expect(
        relayerSenderContractInstance.transferCorrected(
            userAddress.address,
            transferAmountOfTokens,
            recipientAddress.address,
            MyBoysDevsToken.address,
            transferNumber,
            signature1,
        )
    ).to.be.revertedWith("Already executed!");

    transferNumber++
    const messageHash2 = await tokenSenderContract.getHashCorrected(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        transferNumber
    );
    const signature2 = await userAddress.signMessage(arrayify(messageHash2));

    metaTxn = await relayerSenderContractInstance.transferCorrected(
        userAddress.address,
        transferAmountOfTokens,
        recipientAddress.address,
        MyBoysDevsToken.address,
        transferNumber,
        signature2,
    );
    await metaTxn.wait()

    // Check the user's balance decreased, and recipient got 10 tokens
    const userBalance = await MyBoysDevsToken.balanceOf(
        userAddress.address
    );
    const recipientBalance = await MyBoysDevsToken.balanceOf(
        recipientAddress.address
    );

    console.log(`user balance AFTER: ${userBalance}; recipient balance: ${recipientBalance}`);
    expect(userBalance.lt(userBalanceBefore)).to.be.true;
    expect(recipientBalance.gt(transferAmountOfTokens)).to.be.true;
  });
});