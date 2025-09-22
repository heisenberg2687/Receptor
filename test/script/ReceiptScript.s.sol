// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ReceiptVerification.sol"; // Adjust path as needed

contract ReceiptScript is Script {
    function run() external returns (ReceiptVerification) {
        vm.startBroadcast();

        ReceiptVerification receiptVerification = new ReceiptVerification();

        vm.stopBroadcast();

        

        return receiptVerification;
    }
}