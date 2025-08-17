# Contributing to Receipt Verification System

Thank you for your interest in contributing to the Receipt Verification System! This document provides guidelines and information for contributors.

## 🎯 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- MetaMask browser extension
- Basic understanding of Solidity and React

### Setting up the development environment

1. **Fork the repository**
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

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

#### Solidity
- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use meaningful variable and function names
- Include comprehensive NatSpec documentation
- Maximum line length: 120 characters
- Use 4 spaces for indentation

#### JavaScript/React
- Use ES6+ features
- Follow React functional components patterns
- Use meaningful component and variable names
- Maximum line length: 100 characters
- Use 2 spaces for indentation

#### CSS/Tailwind
- Use Tailwind CSS classes whenever possible
- Create custom CSS only when necessary
- Follow mobile-first responsive design principles

### Testing Requirements

#### Smart Contract Tests
- Write comprehensive tests for all functions
- Test both success and failure cases
- Include edge cases and boundary conditions
- Use meaningful test descriptions
- Aim for >95% code coverage

#### Frontend Tests
- Write unit tests for components
- Test user interactions
- Mock Web3 interactions appropriately
- Test responsive design

### Commit Guidelines

Use conventional commit messages:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(contract): add receipt cancellation functionality"
git commit -m "fix(frontend): resolve MetaMask connection issue"
git commit -m "docs(readme): update installation instructions"
```

## 🔧 Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, etc.)
- Screenshots/console logs if applicable

### 💡 Feature Requests

For feature requests, please provide:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach
- Mockups or examples if applicable

### 📖 Documentation

Documentation contributions are always welcome:
- API documentation
- Code comments
- Tutorial improvements
- Translation to other languages

### 🔒 Security

For security issues:
- Do not create public issues
- Email security@reverif.com
- Include detailed information
- Allow time for fix before disclosure

## 🚀 Pull Request Process

### Before Submitting

1. **Run tests**
   ```bash
   npm test
   npx hardhat test
   ```

2. **Check code formatting**
   ```bash
   npm run lint
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update code comments
   - Update API documentation

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changeset appropriate in scope
- [ ] Meaningful commit messages

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on development environment
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

## 🏗️ Architecture Overview

### Smart Contract Architecture
```
ReceiptVerification.sol
├── Business Management
│   ├── registerBusiness()
│   ├── verifyBusiness()
│   └── deactivateBusiness()
├── Receipt Management
│   ├── createReceipt()
│   ├── verifyReceipt()
│   ├── disputeReceipt()
│   └── cancelReceipt()
└── Query Functions
    ├── getReceipt()
    ├── getUserReceipts()
    └── getBusinessReceipts()
```

### Frontend Architecture
```
src/
├── components/
│   └── Layout/
├── pages/
│   ├── Dashboard.jsx
│   ├── CreateReceipt.jsx
│   ├── Business.jsx
│   ├── Verify.jsx
│   └── ReceiptDetails.jsx
├── contexts/
│   └── Web3Context.js
└── config/
    └── contract.js
```

## 🧪 Testing Strategy

### Smart Contract Testing
- Unit tests for individual functions
- Integration tests for workflows
- Gas optimization tests
- Security vulnerability tests

### Frontend Testing
- Component unit tests
- Integration tests
- End-to-end tests
- Cross-browser testing

## 📚 Resources

### Learning Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ethers.js Documentation](https://docs.ethers.io/)

### Tools and Libraries
- **Smart Contract Development**: Hardhat, OpenZeppelin
- **Frontend Development**: React, Tailwind CSS
- **Web3 Integration**: Ethers.js, MetaMask
- **Testing**: Chai, React Testing Library

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Social media mentions

## 💬 Community

### Communication Channels
- 🐛 **Issues**: GitHub Issues for bugs and features
- 💬 **Discord**: [Join our community](https://discord.gg/reverif)
- 📧 **Email**: dev@reverif.com for development questions

### Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📝 Development Workflow

### Feature Development
1. Create issue for discussion
2. Fork repository
3. Create feature branch
4. Implement feature with tests
5. Submit pull request
6. Address review feedback
7. Merge after approval

### Bug Fixes
1. Identify and reproduce bug
2. Create issue if not exists
3. Create fix branch
4. Implement fix with tests
5. Submit pull request
6. Verify fix works
7. Merge after approval

### Release Process
1. Update version numbers
2. Update changelog
3. Create release branch
4. Final testing
5. Create release tag
6. Deploy to networks
7. Publish release notes

## 🔍 Quality Assurance

### Code Review Criteria
- **Functionality**: Code works as intended
- **Security**: No security vulnerabilities
- **Performance**: Optimized for gas and speed
- **Maintainability**: Clean, readable code
- **Testing**: Adequate test coverage
- **Documentation**: Well documented

### Testing Requirements
- All tests must pass
- Code coverage >90%
- No security vulnerabilities
- Performance benchmarks met
- Cross-browser compatibility

Thank you for contributing to the Receipt Verification System! 🎉
