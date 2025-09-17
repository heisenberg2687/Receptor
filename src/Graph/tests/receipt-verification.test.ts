import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BusinessRegistered } from "../generated/schema"
import { BusinessRegistered as BusinessRegisteredEvent } from "../generated/ReceiptVerification/ReceiptVerification"
import { handleBusinessRegistered } from "../src/receipt-verification"
import { createBusinessRegisteredEvent } from "./receipt-verification-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let businessAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let businessName = "Example string value"
    let timestamp = BigInt.fromI32(234)
    let newBusinessRegisteredEvent = createBusinessRegisteredEvent(
      businessAddress,
      businessName,
      timestamp
    )
    handleBusinessRegistered(newBusinessRegisteredEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("BusinessRegistered created and stored", () => {
    assert.entityCount("BusinessRegistered", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BusinessRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "businessAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BusinessRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "businessName",
      "Example string value"
    )
    assert.fieldEquals(
      "BusinessRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
