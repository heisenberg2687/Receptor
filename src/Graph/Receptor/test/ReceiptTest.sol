// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {stdError} from "forge-std/StdError.sol";
import "../src/ReceiptVerification.sol"; 

contract ReceiptVerificationTest is Test {
    ReceiptVerification receiptContract;

    address owner = address(0xA11CE);
    address vendor = address(0xBEEF);
    address customer = address(0xC0FFEE);
    error OwnableUnauthorizedAccount(address account);

    function setUp() public {
        vm.startPrank(owner);
        receiptContract = new ReceiptVerification();
        vm.stopPrank();
    }

    // Tests that a vendor can successfully register a business with valid name and description
    function testRegisterBusiness() public {
        vm.prank(vendor);

        receiptContract.registerBusiness("ShopX", "Sells goods");
        // check storage
        (
            string memory name,
            string memory desc,
            address ownerAddr,
            bool active,
            uint total
        ) = receiptContract.businesses(vendor);

        assertEq(name, "ShopX");
        assertEq(desc, "Sells goods");
        assertEq(ownerAddr, vendor);
        assertEq(active, true);
        assertEq(total, 0);
    }

    // Tests that registering a business reverts if the vendor is already registered
    function testRegisterBusinessRevertsIfAlreadyRegistered() public {
        vm.startPrank(vendor);
        receiptContract.registerBusiness("ShopX", "Sells Goods");
        vm.expectRevert("Business already registered");
        receiptContract.registerBusiness("ShopX", "Sells Goods");
        vm.stopPrank();
    }

    // Tests that registering a business reverts if the business name is empty
    function testRegisterBusinessRevertsIfEmptyName() public {
        vm.startPrank(vendor);
        vm.expectRevert("Business name cannot be empty");
        receiptContract.registerBusiness("", "LOL");
        vm.stopPrank();
    }

    // Tests that a customer can successfully request a receipt with valid parameters
    function testRequestReceiptSuccess() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorX",
            "Laptop",
            2 ether,
            block.timestamp,
            "hash123"
        );
        uint256 RequestId = 1;
        ReceiptVerification.Receipt memory r = receiptContract.getReceipt(1);
        assertEq(r.issuer, vendor);
        assertEq(r.recipient, customer);
        assertEq(
            uint(r.status),
            uint(ReceiptVerification.ReceiptStatus.Requested)
        );
        uint256[] memory userReq = receiptContract.getUserReceipts(customer);
        uint256[] memory BusinessReq = receiptContract.getBusinessReceipts(
            vendor
        );

        assertEq(userReq.length, 1);
        assertEq(BusinessReq.length, 1);
        assertEq(userReq[0], RequestId);
        assertEq(BusinessReq[0], RequestId);
    }

    // Tests that requestReceipt reverts for invalid inputs: zero address, self-request, empty name, zero amount, future date
    function testRequestReceipt_Reverts() public {
        vm.expectRevert("Invalid vendor address");
        receiptContract.requestReceipt(
            address(0),
            "shopX",
            "Hello goods",
            1 ether,
            block.timestamp,
            "QmSomeHash"
        );

        vm.prank(vendor);
        vm.expectRevert("Cannot request receipt from yourself");
        receiptContract.requestReceipt(
            vendor,
            "shopX",
            "Hello goods",
            1 ether,
            block.timestamp,
            "QmSomeHash"
        );
        vm.prank(customer);
        vm.expectRevert("Vendor name cannot be empty");
        receiptContract.requestReceipt(
            vendor,
            "",
            "Hello goods",
            1 ether,
            block.timestamp,
            "QmSomeHash"
        );

        vm.expectRevert("Amount must be greater than zero");
        receiptContract.requestReceipt(
            vendor,
            "shopX",
            "Hello goods",
            0,
            block.timestamp,
            "QmSomeHash"
        );

        vm.prank(customer);
        vm.expectRevert("Transaction date cannot be in the future");
        receiptContract.requestReceipt(
            vendor,
            "shopX",
            "Hello goods",
            1 ether,
            block.timestamp + 100,
            "QmSomeHash"
        );
    }

    // Tests that a vendor can successfully approve a receipt request
    function testApproveReceiptSuccess() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorX",
            "Laptop",
            2 ether,
            block.timestamp,
            "hash123"
        );
        uint256 RequestId = 1;
        vm.prank(vendor);
        receiptContract.approveReceipt(RequestId);

        ReceiptVerification.Receipt memory res = receiptContract.getReceipt(
            RequestId
        );
        assertEq(
            uint(res.status),
            uint(ReceiptVerification.ReceiptStatus.Approved)
        );

        (, , , bool active, uint total) = receiptContract.businesses(vendor);
        if (active) {
            assertEq(total, 1);
        }
    }

    // Tests that approveReceipt reverts if called by a non-vendor
    function testApproveReceipt_RevertsIfNotVendor() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorX",
            "Laptop",
            2 ether,
            block.timestamp,
            "hash123"
        );

        uint256 receiptId = 1;
        vm.prank(customer);
        vm.expectRevert("Only the vendor can perform this action");
        receiptContract.approveReceipt(receiptId);
    }

    // Tests that approveReceipt reverts if the receipt is not in 'Requested' status
    function testApproveReceipt_RevertsIfWrongStatus() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorX",
            "Laptop",
            2 ether,
            block.timestamp,
            "hash123"
        );

        uint256 receiptId = 1;

        vm.prank(vendor);
        receiptContract.approveReceipt(receiptId);

        vm.prank(vendor);
        vm.expectRevert("Receipt is not in requested status");
        receiptContract.approveReceipt(receiptId);
    }

    // Tests that a vendor can successfully reject a receipt request with a reason
    function testRejectReceiptSuccess() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );

        vm.prank(vendor);
        receiptContract.rejectReceipt(1, "Reason");
        ReceiptVerification.Receipt memory res = receiptContract.getReceipt(1);
        assertEq(
            uint(res.status),
            uint(ReceiptVerification.ReceiptStatus.Rejected)
        );
        assertEq(res.rejectionReason, "Reason");
    }

    // Tests that rejectReceipt reverts for non-vendor or if receipt is not in 'Requested' status
    function testRejectReceiptSuccess_Reverts() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );

        vm.prank(customer);
        vm.expectRevert("Only the vendor can perform this action");
        receiptContract.rejectReceipt(1, "Invalid");

        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );

        vm.prank(vendor);
        receiptContract.rejectReceipt(1, "first reject");

        // try rejecting again -> status is not Requested anymore
        vm.expectRevert("Receipt is not in requested status");
        vm.prank(vendor);
        receiptContract.rejectReceipt(1, "second reject");
    }

    // Tests that a customer can successfully verify an approved receipt
    function testVerifyReceiptSuccess() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );
        vm.prank(vendor);
        receiptContract.approveReceipt(1);

        vm.prank(customer);
        receiptContract.verifyReceipt(1);
        ReceiptVerification.Receipt memory res = receiptContract.getReceipt(1);
        assertEq(
            uint(res.status),
            uint(ReceiptVerification.ReceiptStatus.Verified)
        );
    }

    // Tests that verifyReceipt reverts if called by a non-recipient (e.g., vendor)
    function testVerifyReceipt_Reverts() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );
        vm.startPrank(vendor);
        receiptContract.approveReceipt(1);

        vm.expectRevert("Only recipient can verify receipt");
        receiptContract.verifyReceipt(1);
        vm.stopPrank();
    }

    // Tests that a receipt transitions to 'Verified' status after successful verification by recipient
    function testVerifyReceipt_Revert_BeforeVerify() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorZ",
            "Desc",
            1 ether,
            block.timestamp,
            "hash"
        );

        vm.prank(vendor);
        receiptContract.approveReceipt(1);

        vm.prank(customer);
        receiptContract.verifyReceipt(1);

        ReceiptVerification.Receipt memory receipt = receiptContract.getReceipt(
            1
        );
        assertEq(
            uint256(receipt.status),
            uint256(ReceiptVerification.ReceiptStatus.Verified)
        );
    }

    // Tests that a vendor or customer can successfully dispute an approved or verified receipt
    function testDisputeReceipt_Success() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );

        vm.prank(vendor);
        receiptContract.approveReceipt(1);

        vm.startPrank(vendor);
        receiptContract.disputeReceipt(1, "Invalid");
        ReceiptVerification.Receipt memory res = receiptContract.getReceipt(1);
        assertEq(
            uint(res.status),
            uint(ReceiptVerification.ReceiptStatus.Disputed)
        );
        assertEq(res.disputeReason, "Invalid");
        vm.stopPrank();
    }

    // Tests that disputeReceipt reverts if receipt is not in 'Approved' or 'Verified' status
    function testDisputeReceipt_Revert() public {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );

        vm.prank(vendor);
        receiptContract.approveReceipt(1);

        vm.startPrank(vendor);
        receiptContract.disputeReceipt(1, "Invalid");

        vm.startPrank(vendor);
        vm.expectRevert("Can only dispute approved or verified receipts");
        receiptContract.disputeReceipt(1, "Invalid");
    }

    function _requestReceipt() internal returns (uint256) {
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        return 1;
    }

    function _approve(uint256 receiptId) internal {
        vm.prank(vendor);
        receiptContract.approveReceipt(receiptId);
    }

    // Tests that a customer can successfully cancel a receipt request
    function testCancelReceipt_CustomerCancels() public {
        vm.prank(vendor);
        receiptContract.registerBusiness("ShopX", "Desc");

        uint256 r1 = _requestReceipt();
        vm.prank(customer);
        receiptContract.cancelReceipt(r1);
        assertEq(
            uint(receiptContract.getReceipt(r1).status),
            uint(ReceiptVerification.ReceiptStatus.Cancelled)
        );
    }

    // Tests that a vendor can cancel an approved receipt and business totalReceipts is decremented
    function testCancelReceipt_VendorCancels() public {
        vm.prank(vendor);
        receiptContract.registerBusiness("ShopX", "Desc");

        uint256 r1 = _requestReceipt();
        vm.prank(customer);
        receiptContract.cancelReceipt(r1);
        assertEq(
            uint(receiptContract.getReceipt(r1).status),
            uint(ReceiptVerification.ReceiptStatus.Cancelled)
        );
        (, , , , uint total) = receiptContract.businesses(vendor);
        assertEq(total, 0);
    }

    // Tests that getPendingRequests returns empty array when vendor has no receipts
    function testGetPending_NoReceipts() public view {
        uint256[] memory req = receiptContract.getPendingRequests(vendor);
        assertEq(req.length, 0);
    }

    // Tests that getPendingRequests returns all receipts in 'Requested' status
    function testGetPending_AllPending() public {
        vm.startPrank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        vm.stopPrank();

        uint256[] memory pending = receiptContract.getPendingRequests(vendor);
        assertEq(pending.length, 2, "Should return 2 pending receipts");
        assertEq(pending[0], 1);
        assertEq(pending[1], 2);
    }

    // Tests that getPendingRequests returns empty when no receipts are in 'Requested' status
    function testGetPending_NonePending() public {
        vm.startPrank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        vm.stopPrank();

        // Vendor approves both
        vm.startPrank(vendor);
        receiptContract.approveReceipt(1);
        receiptContract.rejectReceipt(2, "Invalid");
        vm.stopPrank();

        uint256[] memory pending = receiptContract.getPendingRequests(vendor);

        assertEq(pending.length, 0, "Expected 0 pending receipts");
    }

    // Tests that getPendingRequests returns only receipts in 'Requested' status when mixed statuses exist
    function testGetPending_Mixed() public {
        vm.startPrank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopX",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopY",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopZ",
            "Desc",
            1 ether,
            block.timestamp,
            "Hash"
        );
        vm.stopPrank();

        // Vendor approves receipt 2
        vm.prank(vendor);
        receiptContract.approveReceipt(2);

        uint256[] memory pending = receiptContract.getPendingRequests(vendor);

        assertEq(pending.length, 2, "Should return 2 pending receipts");
        assertEq(pending[0], 1);
        assertEq(pending[1], 3);
    }

    // Tests that owner can successfully update the deadline period for receipt actions
    function testSetStatusChangePeriod() public {
        vm.prank(owner);
        receiptContract.setStatusChangePeriod(5 days);
        // no getter, so test indirectly by requesting a receipt
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "TestVendor",
            "Desc",
            1 ether,
            block.timestamp,
            "ipfsHash"
        );

        ReceiptVerification.Receipt memory r = receiptContract.getReceipt(1);
        assertEq(r.deadline, block.timestamp + 5 days);
    }

    // Tests that setStatusChangePeriod reverts if called by non-owner
    function testSetStatusChangePeriodRevertsIfNotOwner() public {
        vm.prank(customer);
        vm.expectRevert(
            abi.encodeWithSelector(
                OwnableUnauthorizedAccount.selector,
                customer
            )
        );
        receiptContract.setStatusChangePeriod(5 days);
    }

    // Tests that getReceipt returns correct receipt data for a valid receipt ID
    function testGetReceipt_Success() public {
        // Arrange
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "VendorX",
            "Laptop",
            2 ether,
            block.timestamp,
            "hash123"
        );

        // Act
        ReceiptVerification.Receipt memory receipt = receiptContract.getReceipt(
            1
        );

        // Assert
        assertEq(receipt.id, 1);
        assertEq(receipt.issuer, vendor);
        assertEq(receipt.recipient, customer);
        assertEq(receipt.vendorName, "VendorX");
        assertEq(receipt.amount, 2 ether);
        assertEq(
            uint(receipt.status),
            uint(ReceiptVerification.ReceiptStatus.Requested)
        );
        assertTrue(receipt.exists);
    }

    // Tests that getReceipt reverts when called with a non-existent receipt ID
    function testGetReceipt_RevertsIfNotExists() public {
        // No receipt with ID 999 exists
        vm.expectRevert("Receipt does not exist");
        receiptContract.getReceipt(999);
    }

    // Tests that getUserReceipts returns correct list of receipt IDs for a user with multiple receipts
    function testGetUserReceipts_ReturnsCorrectReceipts() public {
        setUp();
        // Arrange
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopA",
            "Item1",
            1 ether,
            block.timestamp,
            "hash1"
        );
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopB",
            "Item2",
            2 ether,
            block.timestamp,
            "hash2"
        );

        // Act
        uint256[] memory userReceipts = receiptContract.getUserReceipts(
            customer
        );

        // Assert
        assertEq(userReceipts.length, 2);
        assertEq(userReceipts[0], 1);
        assertEq(userReceipts[1], 2);
    }

    // Tests that getUserReceipts returns empty array when user has no receipts
    function testGetUserReceipts_ReturnsEmptyIfNoReceipts() public view {
        uint256[] memory userReceipts = receiptContract.getUserReceipts(
            customer
        );
        assertEq(userReceipts.length, 0);
    }

    // Tests that getBusinessReceipts returns correct list of receipt IDs for a business with multiple receipts
    function testGetBusinessReceipts_ReturnsCorrectReceipts() public {
        // Arrange
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopA",
            "Item1",
            1 ether,
            block.timestamp,
            "hash1"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopB",
            "Item2",
            2 ether,
            block.timestamp,
            "hash2"
        );

        // Act
        uint256[] memory businessReceipts = receiptContract.getBusinessReceipts(
            vendor
        );

        // Assert
        assertEq(businessReceipts.length, 2);
        assertEq(businessReceipts[0], 1);
        assertEq(businessReceipts[1], 2);
    }

    // Tests that getBusinessReceipts returns empty array when business has no receipts
    function testGetBusinessReceipts_ReturnsEmptyIfNoReceipts() public view {
        // Act
        uint256[] memory businessReceipts = receiptContract.getBusinessReceipts(
            vendor
        );

        // Assert
        assertEq(businessReceipts.length, 0);
    }

    // Tests that getTotalReceipts returns correct total after creating multiple receipts
    function testGetTotalReceipts_ReturnsCorrectCount() public {
        // Initially 0
        assertEq(receiptContract.getTotalReceipts(), 0);

        // Create 3 receipts
        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopA",
            "Item1",
            1 ether,
            block.timestamp,
            "hash1"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopB",
            "Item2",
            2 ether,
            block.timestamp,
            "hash2"
        );
        receiptContract.requestReceipt(
            vendor,
            "ShopC",
            "Item3",
            3 ether,
            block.timestamp,
            "hash3"
        );


        assertEq(receiptContract.getTotalReceipts(), 3);
    }

    // Tests that getTotalReceipts increments correctly after each new receipt
    function testGetTotalReceipts_IncrementsCorrectly() public {
        assertEq(receiptContract.getTotalReceipts(), 0);

        vm.prank(customer);
        receiptContract.requestReceipt(
            vendor,
            "ShopA",
            "Item1",
            1 ether,
            block.timestamp,
            "hash1"
        );
        assertEq(receiptContract.getTotalReceipts(), 1);

        receiptContract.requestReceipt(
            vendor,
            "ShopB",
            "Item2",
            2 ether,
            block.timestamp,
            "hash2"
        );
        assertEq(receiptContract.getTotalReceipts(), 2);
    }
}