


# Reverif Graph Subgraph

This subgraph indexes events from the **Reverif** smart contract deployed on **Sepolia** Ethereum testnet, allowing easy access to on-chain data via a GraphQL API.

## Features

* Track registered businesses
* Monitor ownership transfers
* Track receipt lifecycle:

  * Requested
  * Approved
  * Rejected
  * Cancelled
  * Disputed
  * Verified

## Installation

1. Clone the repository:

```bash
git clone https://github.com/heisenberg2687/Receptor.git
cd Receptor/src/Graph
```

2. Install dependencies:

```bash
npm install
```

3. Generate and build subgraph:

```bash
graph codegen
graph build
```

## Configuration

Update the `SUBGRAPH_URL` in your frontend to point to your deployed subgraph:

```javascript
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/120520/p-reverif/version/latest";
```

## Usage

Example query to fetch registered businesses:

```graphql
{
  businessRegistereds(first: 5) {
    id
    businessName
    businessAddress
  }
}
```

Example query to fetch approved receipts:

```graphql
{
  receiptApproveds(first: 10) {
    id
    receiptId
    vendor
    timestamp
  }
}
```

Use **fetch** or any GraphQL client (URQL, Apollo, etc.) to query data in your frontend React app.

## Frontend Example

```javascript
const response = await fetch(SUBGRAPH_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: GET_BUSINESSES_QUERY }),
});
const result = await response.json();
console.log(result.data.businessRegistereds);
```

## Notes

* The subgraph automatically indexes events emitted by the smart contract.
* Ensure your contract events match the subgraph entities.
* After deployment, it may take a few blocks to start syncing.




