# Receipt Verification System (ReVerif)

A blockchain-based receipt verification system built with Solidity smart contracts and React frontend. This system allows businesses to issue digital receipts on the Ethereum blockchain, enabling transparent and tamper-proof transaction verification.

## 🌟 Features

### Core Functionality
- **Digital Receipt Issuance**: Businesses can create and issue receipts on the blockchain
- **Receipt Verification**: Recipients can verify receipt authenticity
- **Dispute Resolution**: Support for disputing fraudulent or incorrect receipts
- **Business Registration**: Businesses must register to issue receipts
- **IPFS Integration**: Support for attaching documents via IPFS hashes

### Smart Contract Features
- **Immutable Records**: All receipts stored permanently on blockchain
- **Access Control**: Role-based permissions for different user types
- **Event Logging**: Comprehensive event emission for transparency
- **Status Management**: Track receipt lifecycle (Pending → Verified/Disputed/Cancelled)
- **Business Verification**: Trusted verifier system for business validation

### Frontend Features
- **Modern UI**: Built with React and Tailwind CSS
- **Web3 Integration**: MetaMask wallet connection
- **Real-time Updates**: Live status updates and notifications
- **Mobile Responsive**: Works on all device sizes
- **Search & Filter**: Easy receipt discovery and management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React App     │◄──►│ Smart Contract  │◄──►│   Ethereum      │
│   (Frontend)    │    │   (Solidity)    │    │   Blockchain    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Web3/MetaMask │    │    Events &     │    │  Immutable      │
│   Integration   │    │   State Mgmt    │    │   Storage       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/reverif.git
   cd reverif
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

4. **Deploy smart contract**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Update contract address**
   - Copy the deployed contract address
   - Update `CONTRACT_ADDRESS` in `frontend/src/config/contract.js`

6. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

7. **Configure MetaMask**
   - Add localhost network (http://127.0.0.1:8545, Chain ID: 31337)
   - Import a test account from Hardhat's output

## 📖 Usage Guide

### For Businesses

1. **Register Your Business**
   - Connect your MetaMask wallet
   - Navigate to Business page
   - Fill in business details and register

2. **Create Receipts**
   - Go to "Create Receipt" page
   - Enter recipient address, amount, and description
   - Optionally add IPFS document hash
   - Submit transaction

3. **Manage Receipts**
   - View all issued receipts on Dashboard
   - Track verification status
   - Handle disputes if necessary

### For Customers

1. **Verify Receipts**
   - Use the "Verify" page to search for receipts
   - Enter receipt ID to view details
   - Verify authentic receipts

2. **Dispute Receipts**
   - Flag fraudulent or incorrect receipts
   - Provide dispute reasons
   - Track dispute resolution

### For Administrators

1. **Verify Businesses**
   ```solidity
   // Add authorized verifier
   await contract.addAuthorizedVerifier(verifierAddress);
   
   // Verify a business
   await contract.verifyBusiness(businessAddress);
   ```

## 🔧 Development

### Smart Contract Development

**Compile contracts**
```bash
npx hardhat compile
```

**Run tests**
```bash
npx hardhat test
```

**Deploy to testnet**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Development

**Start development server**
```bash
cd frontend
npm start
```

**Build for production**
```bash
cd frontend
npm run build
```

### Testing

**Run all tests**
```bash
npm test
```

**Test specific contract**
```bash
npx hardhat test test/ReceiptVerification.test.js
```

## 📁 Project Structure

```
reverif/
├── contracts/
│   └── ReceiptVerification.sol    # Main smart contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── test/
│   └── ReceiptVerification.test.js # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── contexts/              # React contexts
│   │   └── config/                # Configuration files
│   └── public/                    # Static assets
├── hardhat.config.js              # Hardhat configuration
└── package.json                   # Dependencies
```

## 🔐 Security Features

### Smart Contract Security
- **Access Control**: Role-based permissions using OpenZeppelin
- **Reentrancy Protection**: ReentrancyGuard for all state-changing functions
- **Input Validation**: Comprehensive parameter validation
- **Event Logging**: Full audit trail of all actions

### Frontend Security
- **Wallet Integration**: Secure MetaMask connection
- **Transaction Verification**: All transactions verified before execution
- **Error Handling**: Comprehensive error handling and user feedback

## 🌐 Network Support

### Supported Networks
- **Localhost**: For development and testing
- **Sepolia Testnet**: For staging and testing
- **Ethereum Mainnet**: For production deployment

### Network Configuration
Update `hardhat.config.js` and `frontend/src/config/contract.js` for different networks.

## 📊 Smart Contract API

### Core Functions

#### Business Management
```solidity
function registerBusiness(string memory _name, string memory _description)
function verifyBusiness(address _businessAddress)
function deactivateBusiness(address _businessAddress)
```

#### Receipt Management
```solidity
function createReceipt(address _recipient, string memory _description, uint256 _amount, string memory _ipfsHash)
function verifyReceipt(uint256 _receiptId)
function disputeReceipt(uint256 _receiptId)
function cancelReceipt(uint256 _receiptId)
```

#### Query Functions
```solidity
function getReceipt(uint256 _receiptId) returns (Receipt memory)
function getUserReceipts(address _user) returns (uint256[] memory)
function getBusinessReceipts(address _business) returns (uint256[] memory)
function getTotalReceipts() returns (uint256)
```

### Events
```solidity
event ReceiptCreated(uint256 indexed receiptId, address indexed issuer, address indexed recipient, uint256 amount, uint256 timestamp)
event ReceiptVerified(uint256 indexed receiptId, address indexed verifier, uint256 timestamp)
event ReceiptDisputed(uint256 indexed receiptId, address indexed disputer, uint256 timestamp)
event BusinessRegistered(address indexed businessAddress, string businessName, uint256 timestamp)
event BusinessVerified(address indexed businessAddress, address indexed verifier, uint256 timestamp)
```

## 🚀 Deployment

### Testnet Deployment

1. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Fill in your values
   ```

2. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Verify contract (optional)**
   ```bash
   npx hardhat verify CONTRACT_ADDRESS --network sepolia
   ```

### Mainnet Deployment

⚠️ **Warning**: Mainnet deployment requires real ETH and careful testing.

1. **Thorough testing on testnet**
2. **Security audit recommended**
3. **Deploy with sufficient gas**
4. **Verify contract on Etherscan**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices
- Write comprehensive tests
- Document all functions
- Use consistent code formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**MetaMask Connection Issues**
- Ensure MetaMask is installed and unlocked
- Check network configuration
- Clear browser cache if needed

**Transaction Failures**
- Check gas prices and limits
- Ensure sufficient ETH balance
- Verify contract address

**Frontend Issues**
- Clear browser cache and local storage
- Check browser console for errors
- Ensure correct network in MetaMask

### Getting Help
- 📧 Email: support@reverif.com
- 💬 Discord: [Join our community](https://discord.gg/reverif)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/reverif/issues)

## 🔮 Future Enhancements

- [ ] Mobile app development
- [ ] Multi-chain support (Polygon, BSC, etc.)
- [ ] Advanced dispute resolution system
- [ ] Integration with traditional payment systems
- [ ] Analytics dashboard for businesses
- [ ] API for third-party integrations
- [ ] NFT receipt support
- [ ] Bulk receipt operations

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic receipt verification system
- ✅ Business registration
- ✅ Web interface

### Phase 2
- [ ] Mobile application
- [ ] Advanced search and filtering
- [ ] Receipt templates

### Phase 3
- [ ] Enterprise features
- [ ] API ecosystem
- [ ] Multi-chain deployment

---

**Built with ❤️ using Solidity, React, and Ethereum**
Receipt verification system on chain
