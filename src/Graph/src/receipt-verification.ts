import {
  BusinessRegistered as BusinessRegisteredEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ReceiptApproved as ReceiptApprovedEvent,
  ReceiptCancelled as ReceiptCancelledEvent,
  ReceiptDisputed as ReceiptDisputedEvent,
  ReceiptRejected as ReceiptRejectedEvent,
  ReceiptRequested as ReceiptRequestedEvent,
  ReceiptVerified as ReceiptVerifiedEvent
} from "../generated/ReceiptVerification/ReceiptVerification"
import {
  BusinessRegistered,
  OwnershipTransferred,
  ReceiptApproved,
  ReceiptCancelled,
  ReceiptDisputed,
  ReceiptRejected,
  ReceiptRequested,
  ReceiptVerified
} from "../generated/schema"

export function handleBusinessRegistered(event: BusinessRegisteredEvent): void {
  let entity = new BusinessRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.businessAddress = event.params.businessAddress
  entity.businessName = event.params.businessName
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptApproved(event: ReceiptApprovedEvent): void {
  let entity = new ReceiptApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.vendor = event.params.vendor
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptCancelled(event: ReceiptCancelledEvent): void {
  let entity = new ReceiptCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.canceller = event.params.canceller
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptDisputed(event: ReceiptDisputedEvent): void {
  let entity = new ReceiptDisputed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.disputer = event.params.disputer
  entity.reason = event.params.reason
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptRejected(event: ReceiptRejectedEvent): void {
  let entity = new ReceiptRejected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.vendor = event.params.vendor
  entity.reason = event.params.reason
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptRequested(event: ReceiptRequestedEvent): void {
  let entity = new ReceiptRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.customer = event.params.customer
  entity.vendor = event.params.vendor
  entity.vendorName = event.params.vendorName
  entity.amount = event.params.amount
  entity.transactionDate = event.params.transactionDate
  entity.timestamp = event.params.timestamp
  entity.deadline = event.params.deadline

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReceiptVerified(event: ReceiptVerifiedEvent): void {
  let entity = new ReceiptVerified(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.receiptId = event.params.receiptId
  entity.verifier = event.params.verifier
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
