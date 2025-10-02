# MAPS (Massa Automated Payments System)

> **Decentralized Subscription Management on Massa Blockchain**  
> Automated recurring payments with trial periods using Autonomous Smart Contracts (ASC)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Massa](https://img.shields.io/badge/Massa-Blockchain-blue)](https://massa.net/)

## 🌟 Overview

MAPS (Massa Automated Payments System) is a comprehensive subscription management platform built on the Massa blockchain, leveraging Autonomous Smart Contracts (ASC) for automated recurring payments. The platform supports flexible payment models including trial periods, multiple payment methods (escrow deposits and pull-based allowances), and merchant-friendly subscription plans.

### Key Features

- **🔄 Automated Recurring Payments**: ASC-powered deferred calls for seamless subscription renewals
- **🎯 Flexible Trial Periods**: Configurable trial durations (default 7 days) before first payment
- **💰 Multiple Payment Models**: 
  - Escrow deposits for prepaid subscriptions
  - Pull-based allowances for on-demand payments
- **🛡️ Robust Security**: Version-based nonce system prevents replay attacks
- **📱 Modern Web Interface**: React-based dashboard with professional UI/UX
- **⚡ Real-time Updates**: Event-driven architecture with instant feedback

## 🏗️ Architecture

The project consists of four main components:

```
maps/
├── contracts/          # TypeScript contract interfaces
├── asc/subpay-asc/     # AssemblyScript smart contracts
├── onchain/            # Deployment and interaction scripts
└── web/web/            # React frontend application
```

### Smart Contract Layer
- **SubscriptionManager**: Core subscription logic with ASC integration
- **IERC20**: Token interface for payment processing
- **Deferred Call System**: Automated payment execution using Massa's ASC

### Frontend Layer
- **React + TypeScript**: Modern web application
- **Radix UI Components**: Professional component library
- **Massa Web3 Integration**: Seamless wallet connectivity
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Massa wallet (MassaStation or compatible)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maps
   ```

2. **Install dependencies**
```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Development Setup

#### Smart Contract Development
```bash
cd asc/subpay-asc
npm install
npm run build
npm run deploy
```

#### Frontend Development
```bash
cd web/web
npm install
npm run dev
```

The web interface will be available at `http://localhost:5173`

## 📋 Usage Guide

### For Merchants

1. **Create Subscription Plans**
   ```typescript
   // Example: $10/month with 7-day trial
   const planId = await createPlan(
     tokenAddress,    // Payment token contract
     merchantAddress, // Recipient address
     "10000000",     // Amount (10 USDC with 6 decimals)
     604800          // Trial period (7 days in seconds)
   );
   ```

2. **Manage Plans**
   - Pause/resume plans
   - Monitor subscription metrics
   - Track payment history

### For Subscribers

1. **Subscribe to Plans**
   ```typescript
   const subscriptionId = await subscribe(planId);
   ```

2. **Payment Methods**
   - **Escrow Deposit**: Pre-fund account for automatic payments
   - **Pull Allowance**: Approve spending limit for on-demand charges

3. **Manage Subscriptions**
   - View active subscriptions
   - Cancel anytime
   - Monitor payment history

### Web Interface Features

- **💳 Wallet Management**: Connect Massa wallet, view balance
- **📊 Payment Dashboard**: Deposit funds, set allowances, transaction history
- **🏪 Merchant Tools**: Create plans, manage subscriptions
- **📱 Subscription Center**: Subscribe, unsubscribe, payment tracking

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

**Root `.env`:**
```env
MAPS_TOKEN_ADDRESS=AS_YOUR_TOKEN_ADDRESS
MAPS_MERCHANT_ADDRESS=AS_YOUR_MERCHANT_ADDRESS
```

**Web `.env`:**
```env
VITE_MAPS_CONTRACT_ADDRESS=AS_YOUR_CONTRACT_ADDRESS
```

### Contract Deployment

1. **Deploy ASC Contract**
   ```bash
   cd asc/subpay-asc
   npm run deploy
   ```

2. **Update Contract Address**
   Update the contract address in web application configuration

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
cd asc/subpay-asc
npm run test
```

### Manual Testing
The web interface includes test functions for:
- Payment execution simulation
- Subscription lifecycle testing
- Error handling validation

## 📚 API Reference

### Core Contract Methods

#### Plan Management
- `createPlan(token, merchant, amount, trialSeconds)`: Create subscription plan
- `pausePlan(planId)`: Temporarily disable plan
- `resumePlan(planId)`: Reactivate plan

#### Subscription Management
- `subscribe(planId)`: Subscribe to plan
- `unsubscribe(subscriptionId)`: Cancel subscription
- `executePayment(subscriptionId)`: Process payment (ASC-triggered)

#### Payment Methods
- `deposit(amount)`: Add funds to escrow
- `withdraw(amount)`: Remove funds from escrow
- `approvePull(amount)`: Set pull allowance

### Web3 Integration

```typescript
import { connectWallet, createPlan, subscribe } from './lib/massa';

// Connect wallet
const account = await connectWallet();

// Create plan
const result = await createPlan(contractAddress, token, merchant, amount, trial);

// Subscribe
const subscription = await subscribe(contractAddress, planId);
```

## 🛠️ Development

### Project Structure

```
maps/
├── contracts/
│   ├── SubscriptionManager.ts    # Core subscription logic
│   └── IERC20.ts                # Token interface
├── asc/subpay-asc/
│   ├── assembly/contracts/       # AssemblyScript contracts
│   └── src/                     # Deployment scripts
├── scripts/
│   ├── deploy.ts                # Deployment utilities
│   ├── createPlan.ts           # Plan creation
│   └── subscribe.ts            # Subscription management
├── web/web/
│   ├── src/components/         # React components
│   ├── src/lib/               # Web3 integration
│   └── src/styles/            # Styling
└── tests/
    └── subscription.test.ts    # Test suite
```

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- TypeScript with strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Comprehensive test coverage

## 🔗 Resources

### Massa Blockchain
- [Official Documentation](https://docs.massa.net/docs/build)
- [Massa Labs GitHub](https://github.com/massalabs)
- [Massa Web3 SDK](https://github.com/massalabs/massa-web3)

### Development Tools
- [Massa SC Toolkit](https://github.com/massalabs/massa-sc-toolkit)
- [AssemblyScript](https://www.assemblyscript.org/)
- [React Documentation](https://react.dev/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Documentation**: [Project Wiki](../../wiki)

## 🚧 Roadmap

- [ ] Multi-token support
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with major DeFi protocols
- [ ] Subscription marketplace
- [ ] Advanced payment scheduling options

---

**Built with ❤️ on Massa Blockchain**

*MAPS (Massa Automated Payments System) enables the next generation of decentralized subscription services with autonomous smart contracts and seamless user experience.*