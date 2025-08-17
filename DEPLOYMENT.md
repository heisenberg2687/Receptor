# Deployment Guide

This guide covers deploying the Receipt Verification System to various networks.

## 🚀 Quick Deployment

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Update frontend config
# Copy contract address to frontend/src/config/contract.js

# Start frontend
cd frontend && npm start
```

## 🌐 Network Deployment

### Sepolia Testnet

1. **Setup Environment**
   ```bash
   # Create .env file
   PRIVATE_KEY=your_private_key_without_0x
   SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. **Get Test ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your address

3. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Verify Contract**
   ```bash
   npx hardhat verify CONTRACT_ADDRESS --network sepolia
   ```

### Ethereum Mainnet

⚠️ **Warning**: Mainnet deployment costs real ETH. Test thoroughly on testnets first.

1. **Pre-deployment Checklist**
   - [ ] Comprehensive testing on Sepolia
   - [ ] Security audit completed
   - [ ] Gas optimization review
   - [ ] Emergency procedures documented
   - [ ] Sufficient ETH balance

2. **Deploy to Mainnet**
   ```bash
   # Update .env with mainnet details
   PRIVATE_KEY=your_private_key
   MAINNET_URL=https://mainnet.infura.io/v3/your_infura_project_id
   
   # Deploy
   npx hardhat run scripts/deploy.js --network mainnet
   ```

3. **Post-deployment**
   - Verify contract on Etherscan
   - Update frontend configuration
   - Monitor contract for first 24 hours
   - Document contract address

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security review completed
- [ ] Gas optimization done
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Network configuration verified

### During Deployment
- [ ] Deployment transaction confirmed
- [ ] Contract address saved
- [ ] Deployment info recorded
- [ ] Initial state verified

### Post-deployment
- [ ] Contract verified on Etherscan
- [ ] Frontend updated with contract address
- [ ] Basic functionality tested
- [ ] Documentation updated
- [ ] Team notified

## 🔧 Configuration

### Environment Variables
```bash
# Required for testnet/mainnet deployment
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_URL=https://sepolia.infura.io/v3/PROJECT_ID
MAINNET_URL=https://mainnet.infura.io/v3/PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_cmc_api_key
```

### Network Configuration
```javascript
// hardhat.config.js
networks: {
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  },
  sepolia: {
    url: process.env.SEPOLIA_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111,
    gasPrice: 20000000000, // 20 gwei
    gas: 6000000
  },
  mainnet: {
    url: process.env.MAINNET_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1,
    gasPrice: "auto",
    gas: "auto"
  }
}
```

### Frontend Configuration
```javascript
// frontend/src/config/contract.js
export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: "0x...", // Update after deployment
  NETWORKS: {
    localhost: {
      chainId: 31337,
      name: "Localhost",
      rpcUrl: "http://127.0.0.1:8545"
    },
    sepolia: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/PROJECT_ID"
    },
    mainnet: {
      chainId: 1,
      name: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/PROJECT_ID"
    }
  }
};
```

## 💰 Gas Optimization

### Contract Optimization
```solidity
// Compiler optimization settings
settings: {
  optimizer: {
    enabled: true,
    runs: 200
  }
}
```

### Deployment Gas Estimates
- **Contract Deployment**: ~2,500,000 gas
- **Business Registration**: ~100,000 gas
- **Create Receipt**: ~150,000 gas
- **Verify Receipt**: ~50,000 gas

### Gas Optimization Tips
1. Use `calldata` instead of `memory` for read-only parameters
2. Pack structs efficiently
3. Use events for data that doesn't need on-chain storage
4. Batch operations when possible
5. Consider using proxy patterns for upgradability

## 🔍 Verification

### Contract Verification
```bash
# Automatic verification during deployment
npx hardhat verify CONTRACT_ADDRESS --network sepolia

# Manual verification with constructor arguments
npx hardhat verify CONTRACT_ADDRESS \
  --network sepolia \
  --constructor-args arguments.js
```

### Verification Status Check
- Visit Etherscan
- Search for contract address
- Check "Contract" tab
- Look for green checkmark

## 📊 Monitoring

### Key Metrics to Monitor
- Transaction success rate
- Gas usage patterns
- Contract balance
- Active users
- Receipt creation rate
- Verification rate

### Monitoring Tools
- **Etherscan**: Basic contract monitoring
- **Tenderly**: Advanced debugging and monitoring
- **OpenZeppelin Defender**: Security monitoring
- **Grafana**: Custom dashboards

### Alerts Setup
```javascript
// Example monitoring script
const checkContractHealth = async () => {
  const totalReceipts = await contract.getTotalReceipts();
  const lastBlock = await provider.getBlockNumber();
  
  // Send alerts if needed
  if (/* condition */) {
    sendAlert("Contract health check failed");
  }
};
```

## 🚨 Emergency Procedures

### Contract Issues
1. **Pause Operations** (if pause functionality exists)
2. **Assess Impact**
3. **Communicate with Users**
4. **Prepare Fix**
5. **Deploy New Version**

### Frontend Issues
1. **Switch to Backup Frontend**
2. **Fix Issues**
3. **Deploy Updated Version**
4. **Communicate Resolution**

### Security Incidents
1. **Immediate Assessment**
2. **Contact Security Team**
3. **Pause Affected Functions**
4. **Public Communication**
5. **Post-mortem Analysis**

## 📁 Deployment Artifacts

### Files to Save
- Contract address
- Transaction hash
- Block number
- Deployment timestamp
- Constructor arguments
- Verification status

### Deployment Records
```json
{
  "network": "sepolia",
  "contractAddress": "0x...",
  "deploymentTx": "0x...",
  "blockNumber": 12345678,
  "timestamp": "2024-01-01T00:00:00Z",
  "deployer": "0x...",
  "gasUsed": 2500000,
  "gasPrice": "20000000000",
  "verified": true
}
```

## 🔄 Upgrade Strategy

### Proxy Pattern
```solidity
// Consider using OpenZeppelin upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
```

### Migration Process
1. Deploy new implementation
2. Test thoroughly
3. Update proxy
4. Verify functionality
5. Communicate changes

## 📞 Support

### Deployment Issues
- Check network connectivity
- Verify gas prices
- Confirm account balance
- Review error messages

### Common Solutions
- **Out of Gas**: Increase gas limit
- **Nonce Too Low**: Reset MetaMask account
- **Network Issues**: Switch RPC provider
- **Contract Size**: Optimize contract code

### Getting Help
- 📧 Email: deploy@reverif.com
- 💬 Discord: [Join our community](https://discord.gg/reverif)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/reverif/issues)

---

**Remember**: Always test on testnets before mainnet deployment!
