
// SPDX-License-Identifier: MIT

// Layout of Contract:
// version
// imports
// interfaces, libraries, contracts
// errors
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReceiptVerification
 * @dev A smart contract for creating and verifying digital receipts on the blockchain
 */
contract ReceiptVerification is Ownable, ReentrancyGuard {
    uint256 private _deadlinePeriod; // in seconds
    uint256 private _receiptIdCounter;

    enum ReceiptStatus {
        Requested, // Customer has requested receipt
        Approved, // Vendor has approved the request
        Rejected, // Vendor has rejected the request
        Verified, // Receipt has been verified
        Disputed, // Receipt is under dispute
        Cancelled, // Receipt has been cancelled
        Expired // deadline crossed
    }

    struct Receipt {
        uint256 id;
        address issuer; // Vendor/Business address
        address recipient; // Customer address (who requested)
        string vendorName; // Name of vendor provided by customer
        string description;
        uint256 amount;
        uint256 transactionDate; // Date of transaction provided by customer
        uint256 requestTimestamp; // When request was created
        uint256 deadline; // Deadline for vendor to approve/reject (request timestamp + deadlineperiod)
        ReceiptStatus status;
        string ipfsHash; // For storing receipt image/document
        string rejectionReason; // Reason for rejection by vendor
        string disputeReason; // Reason for dispute by vendor
        bool exists;
    }

    struct Business {
        string name;
        string description;
        address owner;
        bool isActive;
        uint256 totalReceipts;
    }

    // Mappings
    mapping(uint256 => Receipt) public receipts;
    mapping(address => Business) public businesses;
    mapping(address => uint256[]) public userReceipts;
    mapping(address => uint256[]) public businessReceipts;

    // Events
    event ReceiptRequested(
        uint256 indexed receiptId,
        address indexed customer,
        address indexed vendor,
        string vendorName,
        uint256 amount,
        uint256 transactionDate,
        uint256 timestamp,
        uint256 deadline
    );

    event ReceiptApproved(
        uint256 indexed receiptId,
        address indexed vendor,
        uint256 timestamp
    );

    event ReceiptRejected(
        uint256 indexed receiptId,
        address indexed vendor,
        string reason,
        uint256 timestamp
    );

    event ReceiptVerified(
        uint256 indexed receiptId,
        address indexed verifier,
        uint256 timestamp
    );

    event ReceiptDisputed(
        uint256 indexed receiptId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );

    event BusinessRegistered(
        address indexed businessAddress,
        string businessName,
        uint256 timestamp
    );

    event ReceiptCancelled(
        uint256 indexed receiptId,
        address indexed canceller,
        uint256 timestamp
    );

    // Modifiers

    /**
     * @dev Modifier to check if the receipt with the given receipt id exists
     */
    modifier onlyExistingReceipt(uint256 _receiptId) {
        require(receipts[_receiptId].exists, "Receipt does not exist");
        _;
    }

    /**
     * @dev Modifier to check if the caller is either the issuer or the recipient of the receipt.
     */
    modifier onlyReceiptParties(uint256 _receiptId) {
        Receipt memory receipt = receipts[_receiptId];
        require(
            msg.sender == receipt.issuer || msg.sender == receipt.recipient,
            "Only issuer or recipient can perform this action"
        );
        _;
    }

    /**
     * @dev Modifier to check if the caller is the vendor and if the action is within the deadline.
     */
    modifier onlyVendorBeforeDeadline(uint256 _receiptId) {
        Receipt storage receipt = receipts[_receiptId];
        require(
            msg.sender == receipt.issuer,
            "Only the vendor can perform this action"
        );
        require(
            block.timestamp <= receipt.deadline,
            "Action window has expired"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        _deadlinePeriod = 7 days; // dafault deadlineperiod
    }

    /**
     * @dev Allows the owner to set the time limit for status changes.
     * @param _period The new period in seconds.
     */
    function setStatusChangePeriod(uint256 _period) external onlyOwner {
        // NEW FUNCTION
        require(_period > 0, "Period must be greater than zero");
        _deadlinePeriod = _period;
    }

    /**
     * @dev Register a new business
     * @param _name Business name
     * @param _description Business description
     */
    function registerBusiness(
        string memory _name,
        string memory _description
    ) external {
        require(bytes(_name).length > 0, "Business name cannot be empty");
        require(
            !businesses[msg.sender].isActive,
            "Business already registered"
        );

        businesses[msg.sender] = Business({
            name: _name,
            description: _description,
            owner: msg.sender,
            isActive: true,
            totalReceipts: 0
        });

        emit BusinessRegistered(msg.sender, _name, block.timestamp);
    }

    /**
     * @dev Customer requests a receipt from a vendor
     * @param _vendorAddress Address of the vendor/business
     * @param _vendorName Name of vendor as known by customer
     * @param _description Description of the transaction
     * @param _amount Transaction amount in wei
     * @param _transactionDate Date of the transaction (timestamp)
     * @param _ipfsHash IPFS hash of any supporting documents
     */
    function requestReceipt(
        address _vendorAddress,
        string memory _vendorName,
        string memory _description,
        uint256 _amount,
        uint256 _transactionDate,
        string memory _ipfsHash
    ) external nonReentrant {
        require(_vendorAddress != address(0), "Invalid vendor address");
        require(
            _vendorAddress != msg.sender,
            "Cannot request receipt from yourself"
        );
        require(bytes(_vendorName).length > 0, "Vendor name cannot be empty");
        // Description is now optional - no validation required
        require(_amount > 0, "Amount must be greater than zero");
        require(
            _transactionDate <= block.timestamp,
            "Transaction date cannot be in the future"
        );

        _receiptIdCounter++;
        uint256 newReceiptId = _receiptIdCounter;
        uint256 deadline = block.timestamp + _deadlinePeriod;

        receipts[newReceiptId] = Receipt({
            id: newReceiptId,
            issuer: _vendorAddress,
            recipient: msg.sender,
            vendorName: _vendorName,
            description: _description,
            amount: _amount,
            transactionDate: _transactionDate,
            requestTimestamp: block.timestamp,
            deadline: block.timestamp + _deadlinePeriod,
            status: ReceiptStatus.Requested,
            rejectionReason: "", // null
            disputeReason: "", // null
            ipfsHash: _ipfsHash,
            exists: true
        });

        userReceipts[msg.sender].push(newReceiptId);
        businessReceipts[_vendorAddress].push(newReceiptId);

        emit ReceiptRequested(
            newReceiptId,
            msg.sender,
            _vendorAddress,
            _vendorName,
            _amount,
            _transactionDate,
            block.timestamp,
            deadline
        );
    }

    /**
     * @dev Vendor approves a receipt request
     * @param _receiptId ID of the receipt to approve
     */
    function approveReceipt(
        uint256 _receiptId
    ) external onlyExistingReceipt(_receiptId) onlyVendorBeforeDeadline(_receiptId) nonReentrant {
        Receipt storage receipt = receipts[_receiptId];
        require(
            msg.sender == receipt.issuer,
            "Only vendor can approve receipt"
        );
        require(
            receipt.status == ReceiptStatus.Requested,
            "Receipt is not in requested status"
        );

        receipt.status = ReceiptStatus.Approved;

        // Update business total receipts if it's a registered business
        if (businesses[msg.sender].isActive) {
            businesses[msg.sender].totalReceipts++;
        }

        emit ReceiptApproved(_receiptId, msg.sender, block.timestamp);
    }

    /**
     * @dev Vendor rejects a receipt request
     * @param _receiptId ID of the receipt to reject
     * @param _reason Reason for rejection
     */
    function rejectReceipt(
        uint256 _receiptId,
        string memory _reason
    ) external onlyExistingReceipt(_receiptId) onlyVendorBeforeDeadline(_receiptId) nonReentrant {
        Receipt storage receipt = receipts[_receiptId];
        require(msg.sender == receipt.issuer, "Only vendor can reject receipt");
        require(
            receipt.status == ReceiptStatus.Requested,
            "Receipt is not in requested status"
        );

        receipt.status = ReceiptStatus.Rejected;
        receipt.rejectionReason = _reason;

        emit ReceiptRejected(_receiptId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @dev Verify a receipt (by recipient only)
     * @param _receiptId ID of the receipt to verify
     */
    function verifyReceipt(
        uint256 _receiptId
    ) external onlyExistingReceipt(_receiptId) nonReentrant {
        Receipt storage receipt = receipts[_receiptId];
        require(
            msg.sender == receipt.recipient,
            "Only recipient can verify receipt"
        );
        require(
            receipt.status == ReceiptStatus.Approved,
            "Receipt must be approved before verification"
        );

        receipt.status = ReceiptStatus.Verified;

        emit ReceiptVerified(_receiptId, msg.sender, block.timestamp);
    }

    /**
     * @dev Dispute a receipt
     * @param _receiptId ID of the receipt to dispute
     */
    function disputeReceipt(
        uint256 _receiptId,
        string memory _reason
    )
        external
        onlyExistingReceipt(_receiptId)
        onlyReceiptParties(_receiptId)
        nonReentrant
    {
        Receipt storage receipt = receipts[_receiptId];
        require(
            receipt.status == ReceiptStatus.Approved ||
                receipt.status == ReceiptStatus.Verified,
            "Can only dispute approved or verified receipts"
        );

        receipt.status = ReceiptStatus.Disputed;
        receipt.disputeReason = _reason;

        emit ReceiptDisputed(_receiptId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @dev Cancel a receipt request (by customer or vendor)
     * @param _receiptId ID of the receipt to cancel
     */
    function cancelReceipt(
        uint256 _receiptId
    )
        external
        onlyExistingReceipt(_receiptId)
        onlyReceiptParties(_receiptId)
        nonReentrant
    {
        Receipt storage receipt = receipts[_receiptId];
        require(
            receipt.status == ReceiptStatus.Requested ||
                receipt.status == ReceiptStatus.Approved,
            "Can only cancel requested or approved receipts"
        );

        // If the receipt was approved, decrement the business's totalReceipts count
        if (receipt.status == ReceiptStatus.Approved) {
            Business storage business = businesses[receipt.issuer];
            if (business.isActive && business.totalReceipts > 0) {
                business.totalReceipts--;
            }
        }

        receipt.status = ReceiptStatus.Cancelled;

        emit ReceiptCancelled(_receiptId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get receipt details
     * @param _receiptId ID of the receipt
     */
    function getReceipt(
        uint256 _receiptId
    ) external view onlyExistingReceipt(_receiptId) returns (Receipt memory) {
        return receipts[_receiptId];
    }

    /**
     * @dev Get user's receipts
     * @param _user Address of the user
     */
    function getUserReceipts(
        address _user
    ) external view returns (uint256[] memory) {
        return userReceipts[_user];
    }

    /**
     * @dev Get business receipts
     * @param _business Address of the business
     */
    function getBusinessReceipts(
        address _business
    ) external view returns (uint256[] memory) {
        return businessReceipts[_business];
    }

    /**
     * @dev Get pending receipt requests for a vendor
     * @param _vendor Address of the vendor
     */
    function getPendingRequests(
        address _vendor
    ) external view returns (uint256[] memory) {
        uint256[] storage allReceipts = businessReceipts[_vendor];
        uint256 pendingCount = 0;

        // First, count how many are pending
        for (uint256 i = 0; i < allReceipts.length; i++) {
            if (receipts[allReceipts[i]].status == ReceiptStatus.Requested) {
                pendingCount++;
            }
        }

        // Create array of pending receipt IDs
        uint256[] memory pendingReceipts = new uint256[](pendingCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < allReceipts.length; i++) {
            if (receipts[allReceipts[i]].status == ReceiptStatus.Requested) {
                pendingReceipts[currentIndex] = allReceipts[i];
                currentIndex++;
            }
        }

        return pendingReceipts;
    }

    /**
     * @dev Get total number of receipts
     */
    function getTotalReceipts() external view returns (uint256) {
        return _receiptIdCounter;
    }
}
