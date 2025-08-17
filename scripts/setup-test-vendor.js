const { ethers } = require("hardhat");
const { CONTRACT_CONFIG } = require("../frontend/src/config/contract");

async function main() {
  console.log("Setting up test vendor...");

  // Get the contract
  const contractAddress = CONTRACT_CONFIG ? CONTRACT_CONFIG.CONTRACT_ADDRESS : "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const ReceiptVerification = await ethers.getContractFactory("ReceiptVerification");
  const contract = ReceiptVerification.attach(contractAddress);

  // Get signers
  const [deployer, testVendor] = await ethers.getSigners();
  
  console.log("Contract address:", contractAddress);
  console.log("Test vendor address:", testVendor.address);
  
  try {
    // Check if business is already registered
    const businessInfo = await contract.businesses(testVendor.address);
    
    if (businessInfo.isActive) {
      console.log("✅ Test vendor is already registered and active!");
      console.log("Business name:", businessInfo.name);
      return;
    }
    
    // Register the test vendor
    console.log("Registering test vendor...");
    
    const tx = await contract.connect(testVendor).registerBusiness(
      "Test Vendor Store",
      "Default test vendor for development and testing purposes"
    );
    
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    
    console.log("✅ Test vendor registered successfully!");
    
    // Verify registration
    const updatedBusinessInfo = await contract.businesses(testVendor.address);
    console.log("Business details:");
    console.log("- Name:", updatedBusinessInfo.name);
    console.log("- Description:", updatedBusinessInfo.description);
    console.log("- Owner:", updatedBusinessInfo.owner);
    console.log("- Active:", updatedBusinessInfo.isActive);
    
  } catch (error) {
    if (error.message.includes("Business already registered")) {
      console.log("✅ Test vendor is already registered!");
    } else {
      console.error("❌ Error setting up test vendor:", error.message);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
