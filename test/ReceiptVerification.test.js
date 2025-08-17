const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReceiptVerification", function () {
  let receiptVerification;
  let owner, business, customer, verifier, addr1;
  
  const businessName = "Test Restaurant";
  const businessDescription = "A test restaurant for verification";
  const receiptDescription = "Dinner for two";
  const receiptAmount = ethers.parseEther("0.1");
  const ipfsHash = "QmTestHashForReceiptDocument";
  
  beforeEach(async function () {
    [owner, business, customer, verifier, addr1] = await ethers.getSigners();
    
    const ReceiptVerification = await ethers.getContractFactory("ReceiptVerification");
    receiptVerification = await ReceiptVerification.deploy();
    await receiptVerification.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await receiptVerification.owner()).to.equal(owner.address);
    });
    
    it("Should set owner as authorized verifier", async function () {
      expect(await receiptVerification.isAuthorizedVerifier(owner.address)).to.be.true;
    });
  });
  
  describe("Business Registration", function () {
    it("Should register a new business", async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      
      const businessData = await receiptVerification.businesses(business.address);
      expect(businessData.name).to.equal(businessName);
      expect(businessData.description).to.equal(businessDescription);
      expect(businessData.owner).to.equal(business.address);
      expect(businessData.isActive).to.be.true;
      expect(businessData.isVerified).to.be.false;
    });
    
    it("Should emit BusinessRegistered event", async function () {
      await expect(receiptVerification.connect(business).registerBusiness(businessName, businessDescription))
        .to.emit(receiptVerification, "BusinessRegistered");
    });
    
    it("Should not allow empty business name", async function () {
      await expect(
        receiptVerification.connect(business).registerBusiness("", businessDescription)
      ).to.be.revertedWith("Business name cannot be empty");
    });
    
    it("Should not allow duplicate business registration", async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      
      await expect(
        receiptVerification.connect(business).registerBusiness(businessName, businessDescription)
      ).to.be.revertedWith("Business already registered");
    });
  });
  
  describe("Business Verification", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
    });
    
    it("Should verify a registered business by owner", async function () {
      await receiptVerification.connect(owner).verifyBusiness(business.address);
      
      const businessData = await receiptVerification.businesses(business.address);
      expect(businessData.isVerified).to.be.true;
    });
    
    it("Should verify a registered business by authorized verifier", async function () {
      await receiptVerification.connect(owner).addAuthorizedVerifier(verifier.address);
      await receiptVerification.connect(verifier).verifyBusiness(business.address);
      
      const businessData = await receiptVerification.businesses(business.address);
      expect(businessData.isVerified).to.be.true;
    });
    
    it("Should emit BusinessVerified event", async function () {
      await expect(receiptVerification.connect(owner).verifyBusiness(business.address))
        .to.emit(receiptVerification, "BusinessVerified");
    });
    
    it("Should not allow unauthorized users to verify business", async function () {
      await expect(
        receiptVerification.connect(customer).verifyBusiness(business.address)
      ).to.be.revertedWith("Not authorized to verify");
    });
    
    it("Should not verify unregistered business", async function () {
      await expect(
        receiptVerification.connect(owner).verifyBusiness(customer.address)
      ).to.be.revertedWith("Business not registered");
    });
  });
  
  describe("Authorized Verifiers", function () {
    it("Should add authorized verifier", async function () {
      await receiptVerification.connect(owner).addAuthorizedVerifier(verifier.address);
      expect(await receiptVerification.isAuthorizedVerifier(verifier.address)).to.be.true;
    });
    
    it("Should remove authorized verifier", async function () {
      await receiptVerification.connect(owner).addAuthorizedVerifier(verifier.address);
      await receiptVerification.connect(owner).removeAuthorizedVerifier(verifier.address);
      expect(await receiptVerification.isAuthorizedVerifier(verifier.address)).to.be.false;
    });
    
    it("Should not allow non-owner to add verifier", async function () {
      await expect(
        receiptVerification.connect(business).addAuthorizedVerifier(verifier.address)
      ).to.be.reverted;
    });
  });
  
  describe("Receipt Creation", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
    });
    
    it("Should create a new receipt", async function () {
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.issuer).to.equal(business.address);
      expect(receipt.recipient).to.equal(customer.address);
      expect(receipt.description).to.equal(receiptDescription);
      expect(receipt.amount).to.equal(receiptAmount);
      expect(receipt.status).to.equal(0); // Pending
      expect(receipt.ipfsHash).to.equal(ipfsHash);
      expect(receipt.exists).to.be.true;
    });
    
    it("Should emit ReceiptCreated event", async function () {
      await expect(
        receiptVerification.connect(business).createReceipt(
          customer.address,
          receiptDescription,
          receiptAmount,
          ipfsHash
        )
      ).to.emit(receiptVerification, "ReceiptCreated");
    });
    
    it("Should increment receipt counter", async function () {
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
      
      expect(await receiptVerification.getTotalReceipts()).to.equal(1);
    });
    
    it("Should not allow unregistered business to create receipt", async function () {
      await expect(
        receiptVerification.connect(customer).createReceipt(
          business.address,
          receiptDescription,
          receiptAmount,
          ipfsHash
        )
      ).to.be.revertedWith("Business not registered or inactive");
    });
    
    it("Should not allow creating receipt for yourself", async function () {
      await expect(
        receiptVerification.connect(business).createReceipt(
          business.address,
          receiptDescription,
          receiptAmount,
          ipfsHash
        )
      ).to.be.revertedWith("Cannot create receipt for yourself");
    });
    
    it("Should not allow zero amount", async function () {
      await expect(
        receiptVerification.connect(business).createReceipt(
          customer.address,
          receiptDescription,
          0,
          ipfsHash
        )
      ).to.be.revertedWith("Amount must be greater than zero");
    });
  });
  
  describe("Receipt Verification", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
    });
    
    it("Should allow recipient to verify receipt", async function () {
      await receiptVerification.connect(customer).verifyReceipt(1);
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.status).to.equal(1); // Verified
    });
    
    it("Should allow authorized verifier to verify receipt", async function () {
      await receiptVerification.connect(owner).addAuthorizedVerifier(verifier.address);
      await receiptVerification.connect(verifier).verifyReceipt(1);
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.status).to.equal(1); // Verified
    });
    
    it("Should emit ReceiptVerified event", async function () {
      await expect(receiptVerification.connect(customer).verifyReceipt(1))
        .to.emit(receiptVerification, "ReceiptVerified");
    });
    
    it("Should not allow unauthorized users to verify", async function () {
      await expect(
        receiptVerification.connect(addr1).verifyReceipt(1)
      ).to.be.revertedWith("Only recipient or authorized verifier can verify");
    });
    
    it("Should not verify already verified receipt", async function () {
      await receiptVerification.connect(customer).verifyReceipt(1);
      
      await expect(
        receiptVerification.connect(customer).verifyReceipt(1)
      ).to.be.revertedWith("Receipt is not in pending status");
    });
  });
  
  describe("Receipt Dispute", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
    });
    
    it("Should allow recipient to dispute receipt", async function () {
      await receiptVerification.connect(customer).disputeReceipt(1);
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.status).to.equal(2); // Disputed
    });
    
    it("Should allow issuer to dispute receipt", async function () {
      await receiptVerification.connect(business).disputeReceipt(1);
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.status).to.equal(2); // Disputed
    });
    
    it("Should emit ReceiptDisputed event", async function () {
      await expect(receiptVerification.connect(customer).disputeReceipt(1))
        .to.emit(receiptVerification, "ReceiptDisputed");
    });
    
    it("Should not allow unauthorized users to dispute", async function () {
      await expect(
        receiptVerification.connect(addr1).disputeReceipt(1)
      ).to.be.revertedWith("Only issuer or recipient can perform this action");
    });
  });
  
  describe("Receipt Cancellation", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
    });
    
    it("Should allow issuer to cancel pending receipt", async function () {
      await receiptVerification.connect(business).cancelReceipt(1);
      
      const receipt = await receiptVerification.getReceipt(1);
      expect(receipt.status).to.equal(3); // Cancelled
    });
    
    it("Should not allow non-issuer to cancel receipt", async function () {
      await expect(
        receiptVerification.connect(customer).cancelReceipt(1)
      ).to.be.revertedWith("Only issuer can cancel receipt");
    });
    
    it("Should not cancel verified receipt", async function () {
      await receiptVerification.connect(customer).verifyReceipt(1);
      
      await expect(
        receiptVerification.connect(business).cancelReceipt(1)
      ).to.be.revertedWith("Can only cancel pending receipts");
    });
  });
  
  describe("Query Functions", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
      await receiptVerification.connect(business).createReceipt(
        customer.address,
        receiptDescription,
        receiptAmount,
        ipfsHash
      );
    });
    
    it("Should get user receipts", async function () {
      const userReceipts = await receiptVerification.getUserReceipts(customer.address);
      expect(userReceipts.length).to.equal(1);
      expect(userReceipts[0]).to.equal(1);
    });
    
    it("Should get business receipts", async function () {
      const businessReceipts = await receiptVerification.getBusinessReceipts(business.address);
      expect(businessReceipts.length).to.equal(1);
      expect(businessReceipts[0]).to.equal(1);
    });
    
    it("Should get total receipts count", async function () {
      expect(await receiptVerification.getTotalReceipts()).to.equal(1);
    });
  });
  
  describe("Business Deactivation", function () {
    beforeEach(async function () {
      await receiptVerification.connect(business).registerBusiness(businessName, businessDescription);
    });
    
    it("Should allow owner to deactivate business", async function () {
      await receiptVerification.connect(owner).deactivateBusiness(business.address);
      
      const businessData = await receiptVerification.businesses(business.address);
      expect(businessData.isActive).to.be.false;
    });
    
    it("Should not allow non-owner to deactivate business", async function () {
      await expect(
        receiptVerification.connect(business).deactivateBusiness(business.address)
      ).to.be.reverted;
    });
  });
  
  // Helper function to get current block timestamp
  async function getBlockTimestamp() {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    return block.timestamp;
  }
});
