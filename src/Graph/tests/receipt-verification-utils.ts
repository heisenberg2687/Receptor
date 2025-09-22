import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BusinessRegistered,
  OwnershipTransferred,
  ReceiptApproved,
  ReceiptCancelled,
  ReceiptDisputed,
  ReceiptRejected,
  ReceiptRequested,
  ReceiptVerified
} from "../generated/ReceiptVerification/ReceiptVerification"

export function createBusinessRegisteredEvent(
  businessAddress: Address,
  businessName: string,
  timestamp: BigInt
): BusinessRegistered {
  let businessRegisteredEvent = changetype<BusinessRegistered>(newMockEvent())

  businessRegisteredEvent.parameters = new Array()

  businessRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "businessAddress",
      ethereum.Value.fromAddress(businessAddress)
    )
  )
  businessRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "businessName",
      ethereum.Value.fromString(businessName)
    )
  )
  businessRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return businessRegisteredEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createReceiptApprovedEvent(
  receiptId: BigInt,
  vendor: Address,
  timestamp: BigInt
): ReceiptApproved {
  let receiptApprovedEvent = changetype<ReceiptApproved>(newMockEvent())

  receiptApprovedEvent.parameters = new Array()

  receiptApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptApprovedEvent.parameters.push(
    new ethereum.EventParam("vendor", ethereum.Value.fromAddress(vendor))
  )
  receiptApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return receiptApprovedEvent
}

export function createReceiptCancelledEvent(
  receiptId: BigInt,
  canceller: Address,
  timestamp: BigInt
): ReceiptCancelled {
  let receiptCancelledEvent = changetype<ReceiptCancelled>(newMockEvent())

  receiptCancelledEvent.parameters = new Array()

  receiptCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptCancelledEvent.parameters.push(
    new ethereum.EventParam("canceller", ethereum.Value.fromAddress(canceller))
  )
  receiptCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return receiptCancelledEvent
}

export function createReceiptDisputedEvent(
  receiptId: BigInt,
  disputer: Address,
  reason: string,
  timestamp: BigInt
): ReceiptDisputed {
  let receiptDisputedEvent = changetype<ReceiptDisputed>(newMockEvent())

  receiptDisputedEvent.parameters = new Array()

  receiptDisputedEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptDisputedEvent.parameters.push(
    new ethereum.EventParam("disputer", ethereum.Value.fromAddress(disputer))
  )
  receiptDisputedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )
  receiptDisputedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return receiptDisputedEvent
}

export function createReceiptRejectedEvent(
  receiptId: BigInt,
  vendor: Address,
  reason: string,
  timestamp: BigInt
): ReceiptRejected {
  let receiptRejectedEvent = changetype<ReceiptRejected>(newMockEvent())

  receiptRejectedEvent.parameters = new Array()

  receiptRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptRejectedEvent.parameters.push(
    new ethereum.EventParam("vendor", ethereum.Value.fromAddress(vendor))
  )
  receiptRejectedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )
  receiptRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return receiptRejectedEvent
}

export function createReceiptRequestedEvent(
  receiptId: BigInt,
  customer: Address,
  vendor: Address,
  vendorName: string,
  amount: BigInt,
  transactionDate: BigInt,
  timestamp: BigInt,
  deadline: BigInt
): ReceiptRequested {
  let receiptRequestedEvent = changetype<ReceiptRequested>(newMockEvent())

  receiptRequestedEvent.parameters = new Array()

  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam("customer", ethereum.Value.fromAddress(customer))
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam("vendor", ethereum.Value.fromAddress(vendor))
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam("vendorName", ethereum.Value.fromString(vendorName))
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "transactionDate",
      ethereum.Value.fromUnsignedBigInt(transactionDate)
    )
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  receiptRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )

  return receiptRequestedEvent
}

export function createReceiptVerifiedEvent(
  receiptId: BigInt,
  verifier: Address,
  timestamp: BigInt
): ReceiptVerified {
  let receiptVerifiedEvent = changetype<ReceiptVerified>(newMockEvent())

  receiptVerifiedEvent.parameters = new Array()

  receiptVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "receiptId",
      ethereum.Value.fromUnsignedBigInt(receiptId)
    )
  )
  receiptVerifiedEvent.parameters.push(
    new ethereum.EventParam("verifier", ethereum.Value.fromAddress(verifier))
  )
  receiptVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return receiptVerifiedEvent
}
