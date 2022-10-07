const {ethers} = require("hardhat");
require('dotenv').config({path:".env"});
const { CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main()
{
  const cryptoDevTokenAddress = CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS;

  const exchangeContractFactory = await ethers.getContractFactory("Exchange");

  const deployedExchangeContract = await exchangeContractFactory.deploy(cryptoDevTokenAddress);

  await deployedExchangeContract.deployed();

  console.log("Exchange Contract Factory Address:", deployedExchangeContract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});