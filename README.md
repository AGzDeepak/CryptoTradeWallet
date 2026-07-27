# ⚡ CryptoBot AI — Institutional Spatial Arbitrage & Quantitative Trading Terminal

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Web3](https://img.shields.io/badge/Web3-MetaMask-F6851B.svg?style=for-the-badge&logo=metamask)](https://metamask.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **CryptoBot AI** is a state-of-the-art, institutional-grade cryptocurrency spatial arbitrage scanner and quantitative automated trading terminal. Powered by React 18, Vite, Recharts, EIP-1193 Web3 providers, and Firebase Authentication with real-time Firestore database logging.

---

## 🚀 Live Production Access

- **🌐 Live Web Terminal**: [https://tradebot-25d4f.web.app](https://tradebot-25d4f.web.app)
- **📦 GitHub Repository**: [https://github.com/AGzDeepak/cryptobot](https://github.com/AGzDeepak/cryptobot)
- **🔥 Firebase Console**: [https://console.firebase.google.com/project/tradebot-25d4f/overview](https://console.firebase.google.com/project/tradebot-25d4f/overview)

---

## 🌟 Institutional Feature Matrix

### 1. ⚡ High-Frequency Spatial Arbitrage Engine
- **Multi-Exchange Live Feeders**: Continuous orderbook tick streaming across **Binance**, **Bybit**, **OKX**, and **Coinbase**.
- **Real-Time Spread Scanner**: Computes cross-exchange price discrepancies, gross yield, network gas fees, and net arbitrage profitability every `800ms`.
- **1-Click Arbitrage Execution**: Instant execution of high-profit spatial routes (`Buy Exchange ➔ Sell Exchange`).

### 2. 💸 Dual Wallet Architecture (Real Web3 & Demo Paper Wallet)
- **`[ 🧪 DEMO MODE ($100k) ]`**: Per-user isolated paper trading workspace pre-funded with `$100,000.00 USDT` virtual balance.
- **`[ ⚡ REAL WEB3 WALLET ]`**: Real EIP-1193 wallet connection supporting **MetaMask**, **Trust Wallet**, **Coinbase Wallet**, and **WalletConnect**.
- **Interactive Withdraw & Deposit System**: Full-featured withdrawal modal supporting multi-chain routing (**Arbitrum One**, **Ethereum Mainnet**, **Polygon**, **Solana**) with input validation and instant paper/Web3 transfers.

### 3. 🤖 Autonomous Trading AI Engine & Autopilot
- **Master Autopilot Control**: Enable/disable automated quantitative execution with 3 strategy modes:
  - ⚡ **Aggressive**: Lower threshold targets for max frequency (`0.10%`).
  - ⚖️ **Balanced**: Optimized risk/reward ratio (`0.25%`).
  - 🛡️ **Conservative**: High-yield premium arbitrage targets (`0.50%+`).
- **Telemetry & Gateway Health**: Real-time ping latency (`14ms`), server uptime (`99.99%`), and gateway health monitoring.

### 4. 🗄️ Firebase Firestore Real-Time Database Logging
- **`login_logs` Collection**: 256-bit AES encrypted audit trail of every session with server timestamps and user agent telemetry.
- **`users` Collection**: Manages user profiles, role privileges (*Institutional Quant Trader*), and last active timestamps.
- **`withdrawals` Collection**: Stores all withdrawal transactions with destination addresses, network chains, amounts, and transaction hashes.
- **`feedback_submissions` Collection**: User rating (1-5 ⭐) and platform feedback submissions stored directly in Firestore.

### 5. 🤖 24/7 AI Quant Support Desk Assistant
- Integrated AI Assistant (`AI_SUPPORT` modal) with 1-click suggestion chips to assist traders with spatial arbitrage rules, Web3 wallet setup, and bot strategy configuration.

### 6. 🎨 Obsidian Dark Glassmorphic UI System
- Modern dark mode with translucent card backdrops (`rgba(22, 26, 35, 0.85)`), emerald green `#34d399` accents, interactive Recharts area analytics, and Web Audio sound effects.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology |
| :--- | :--- |
| **Core Frontend** | [React 18.2](https://reactjs.org/) + [Vite 5.4](https://vitejs.dev/) |
| **Styling System** | [TailwindCSS 3.4](https://tailwindcss.com/) + Custom Glassmorphic Utilities |
| **State Engine** | React Context API (`CryptoContext.jsx`) |
| **Web3 & Blockchain** | EIP-1193 Window Ethereum Provider + MetaMask SDK (`web3Service.js`) |
| **Backend & Database** | [Firebase Auth](https://firebase.google.com/) & [Firestore Real-Time Database](https://firebase.google.com/docs/firestore) |
| **Charts & Graphics** | [Recharts](https://recharts.org/) + Canvas Particle Engine |
| **Iconography & UI** | [Lucide React](https://lucide.dev/) + Canvas Confetti |
| **Audio Processing** | Web Audio API Synthesizer (`audio.js`) |
| **Deployments** | Firebase Hosting & GitHub Pages (`gh-pages`) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AGzDeepak/cryptobot.git
cd cryptobot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

---

## 📦 Production Build & Deployment

### Build Bundle
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Deploy to Firebase Hosting
```bash
npx firebase-tools login
npx firebase-tools deploy
```

---

## 📂 Directory Map

```
cryptobot/
├── src/
│   ├── components/
│   │   ├── AiStrategyPanel.jsx     # AI Trading Bot Strategies
│   │   ├── ArbitragePanel.jsx     # Spatial Arbitrage Scanner Matrix
│   │   ├── AuthScreen.jsx         # Firebase Auth & GitHub OAuth Screen
│   │   ├── AutoTraderBar.jsx      # Master Bot Autopilot Control
│   │   ├── ExchangeStatus.jsx     # API Telemetry & Latency Health
│   │   ├── GlobalModals.jsx       # Wallet, Withdraw, Deposit & Support Modals
│   │   ├── Header.jsx             # Dual Wallet Mode Pill & Profile Badge
│   │   ├── LiveChart.jsx          # Recharts Market Analytics Area Chart
│   │   ├── LivePositions.jsx      # Active Open Arbitrage Positions
│   │   ├── OperationSwapTool.jsx  # Dynamic Swap & Exchange Tool
│   │   ├── PaperTradingPanel.jsx  # Paper Wallet Execution & Presets
│   │   ├── Sidebar.jsx            # Navigation & AI Support Desk Buttons
│   │   ├── TotalAssetsHero.jsx    # Hero Balance & Dynamic BTC Conversion
│   │   └── TransactionsWidget.jsx # Settlement Transaction History
│   ├── config/
│   │   └── firebase.js            # Firebase App, Auth & Firestore Config
│   ├── context/
│   │   └── CryptoContext.jsx      # Master Application React Context State
│   ├── services/
│   │   ├── securityService.js     # Firestore Audit & Withdrawal Log Helpers
│   │   └── web3Service.js         # Real Web3 Wallet & MetaMask Provider
│   ├── utils/
│   │   └── audio.js               # Web Audio API Synth Effects
│   ├── App.jsx                    # Root Shell & Route Guard
│   ├── index.css                  # Dark Glassmorphism CSS System
│   └── main.jsx                   # React DOM Entry
├── firebase.json                  # Firebase Hosting Config
├── .firebaserc                    # Firebase Project Alias (tradebot-25d4f)
├── vite.config.js                 # Vite Base & Build Config
└── package.json                   # Dependencies & Deployment Scripts
```

---

## 👤 Author

**Deepak Kumar**
- **GitHub**: [@AGzDeepak](https://github.com/AGzDeepak)
- **Repository**: [AGzDeepak/cryptobot](https://github.com/AGzDeepak/cryptobot)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
