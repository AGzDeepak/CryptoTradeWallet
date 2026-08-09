# ⚡ CHAINBLOCK — Advanced Crypto Quant Bot & Web3 Smart Contract Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18.x-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev)
[![MetaMask](https://img.shields.io/badge/MetaMask-Web3--Ready-orange.svg)](https://metamask.io)

**Chainblock** is an institutional-grade Crypto Trading Platform, Spatial Arbitrage Quant Bot, and Web3 Smart Contract Ecosystem built with React 18, Vite, TailwindCSS, and EIP-1193 Web3 MetaMask Integration.

---

## 🌟 Key Features & Modules

### 🦊 1. MetaMask Web3 Advanced Quant Terminal
- **On-Chain Spatial Arbitrage Executor**: Sign and broadcast `executeSpatialArbitrage()` contract calls directly via connected MetaMask wallet (`window.ethereum.request`).
- **ERC-20 Token Allowance Manager**: Inspect, grant, or revoke spending allowances (`USDT`, `USDC`, `WETH`, `DAI`) for smart contract routers with 1-click Web3 approvals.
- **EIP-1559 Live Web3 Gas Station**: Real-time Gwei estimator offering `Slow Saver (12.4 Gwei)`, `Standard Market (18.2 Gwei)`, `Fast Execution (25.8 Gwei)`, and `Instant Quant Speed (38.5 Gwei)` tiers.
- **On-Chain Activity Audit Ledger**: Persistent log tracking all Web3 contract calls, token approvals, and spatial arbitrage trades with direct Etherscan tx verification links.

### 📝 2. Remix Solidity IDE & Smart Contract Deployment (Steps 1–8)
- Complete 8-step interactive Remix IDE workflow built directly inside the platform:
  1. **Solidity Source Editor**: Code custom Smart Contracts or select pre-compiled templates.
  2. **Compiler Settings**: Select Solc compiler version (`0.8.20`) and EVM Target (`Paris / Shanghai`).
  3. **Compilation**: Live compiler diagnostic output and ABI/Bytecode generation.
  4. **Environment Selection**: Choose between `Injected Provider - MetaMask` (Sepolia/Arbitrum) or Remix VM.
  5. **Contract Selection**: Choose target contract artifact (`SpatialArbitrageEngine.sol`).
  6. **Deployment Parameters**: Input constructor arguments (`initialRouter`, `feeRecipient`).
  7. **Deploy Contract**: 1-click Web3 contract creation transaction via MetaMask signing.
  8. **Deployed Contract Interaction**: Read state variables (`owner`, `minProfitRate`) and execute state-changing functions.

### 🏦 3. Bank-to-Bank Wire Transfer & Web3 Transfer Portal
- **Portion 1: MetaMask Account-to-Account Web3 Transfer**: Direct 1-click EVM token transfers with instant tx receipts.
- **Portion 2: Professional Bank Wire Transfer Engine**: Professional wire transfer form with clean placeholders for IBAN, SWIFT/BIC, Beneficiary Name, and Memo, plus `⚡ FILL SAMPLE TEMPLATE` and `🧹 CLEAR FORM` helper actions.

### 🤖 4. Paper Trading Automated Quant Autopilot Engine
- **Continuous Endless Trading**: Dynamic position sizing (`Math.min(balance * 0.1, 50.00)`) and auto-reseeding guarantee that the bot **never halts at $14 or low balances**.
- **Min Profit Threshold Selector**: 1-click preset buttons (`0.25%`, `0.50%`, `1.00%`, `2.50%`, `5.00% MAX YIELD`) with exact 1:1 spread filtering.
- **Scrolling Execution Feed**: Live real-time execution logs and 1-click manual bot trade trigger.

### 📊 5. True Live Market Data Feed
- Real-time Binance ticker integration for top trading pairs: `BTC/USDT`, `ETH/USDT`, `LTC/USDT` ($68.50), and `SOL/USDT`.

### 🎨 6. Adopted Crypto UI Color Palette
- High-contrast Deep Obsidian Dark Theme (`#0e1526`), Neon Bullish Emerald (`#00e676`), Bearish Crimson Coral (`#ff3b69`), and Cyber Web3 Cyan (`#00f2fe`).

---

## 🛠️ Technology Stack

- **Core**: React 18, Vite 5, JavaScript (ES6+).
- **Styling**: Vanilla CSS3 + TailwindCSS, Glassmorphic UI design system.
- **Web3**: EIP-1193 MetaMask Provider, Etherscan API.
- **Icons & UI Assets**: Lucide React Icons.
- **State & Persistence**: React Context API (`CryptoContext.jsx`) + localStorage persistence.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MetaMask Browser Extension (optional for real Web3 transactions)

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/AGzDeepak/CryptoTradeBot.git

# 2. Navigate to project directory
cd CryptoTradeBot

# 3. Install dependencies
npm install

# 4. Start local Vite development server
npm run dev
```

The application will be accessible locally at `http://localhost:3000/`.

### Building for Production

```bash
# Generate production bundle
npm run build
```

---

## 📁 Repository Structure

```
CryptoTradeBot/
├── src/
│   ├── components/
│   │   ├── MetaMaskTradeTerminalSection.jsx   # Web3 Gas, Allowances & Spatial Arbitrage
│   │   ├── ContractProcessSection.jsx          # Remix Solidity IDE (Steps 1-8)
│   │   ├── BankToBankTransferSection.jsx       # Wire Transfer & MetaMask Transfer
│   │   ├── PaperTradingPanel.jsx              # Automated Quant Bot & Controls
│   │   ├── TotalAssetsHero.jsx                # Live Binance Market Cards
│   │   ├── Sidebar.jsx                        # Navigation & Crypto Theme
│   │   └── Header.jsx                         # Top Header & Autopilot Switcher
│   ├── context/
│   │   └── CryptoContext.jsx                  # Main State Engine & Quant Loop
│   ├── index.css                              # Adopted Crypto UI Color System
│   └── App.jsx                                # Main App Shell
├── package.json
└── README.md
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
