const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of ReceiptVerification contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get the contract balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy the contract
  const ReceiptVerification = await ethers.getContractFactory("ReceiptVerification");
  
  console.log("Deploying ReceiptVerification contract...");
  const receiptVerification = await ReceiptVerification.deploy();
  
  await receiptVerification.waitForDeployment();
  
  console.log("✅ ReceiptVerification contract deployed to:", await receiptVerification.getAddress());
  console.log("✅ Transaction hash:", receiptVerification.deploymentTransaction().hash);
  
  // Verify the deployment
  console.log("\nVerifying deployment...");
  const owner = await receiptVerification.owner();
  console.log("Contract owner:", owner);
  console.log("Deployer address:", deployer.address);
  console.log("Owner matches deployer:", owner === deployer.address);
  
  // Save deployment info
  const contractAddress = await receiptVerification.getAddress();
  const deploymentTx = receiptVerification.deploymentTransaction();
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: deploymentTx.hash,
    blockNumber: deploymentTx.blockNumber,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString()
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Optionally save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update the frontend configuration with the contract address");
  console.log("2. Verify the contract on Etherscan (if deploying to mainnet/testnet)");
  console.log("3. Test the contract functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
