# ⚡ Chainblock AI — Institutional Spatial Arbitrage & Quantitative Trading Terminal

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Chainblock AI** is an institutional-grade, high-frequency cryptocurrency spatial arbitrage scanning and automated paper trading terminal built with React 18, Vite, Recharts, and Firebase Authentication. Designed with a sleek Dark Glassmorphism interface, it monitors orderbook price discrepancies across major exchanges in real-time.

---

## 🚀 Recent Live Deployments & Enhancements

- 💸 **Interactive Web3 & Demo Withdrawal System**: Complete withdrawal module supporting native Web3 transaction execution (`eth_sendTransaction`), target network chain selection (`Arbitrum One`, `Ethereum Mainnet`, `Polygon`), destination address validation, and instant paper balance deductions.
- 🔥 **Firebase Auth & Firestore Integration**: Connected to project `tradebot-25d4f`. Real-time user account creation (`createUserWithEmailAndPassword`), session security audit logging (`login_logs`), user metadata tracking (`users`), and platform rating submissions (`feedback_submissions`).
- 🤖 **24/7 AI Support Desk Assistant**: Built-in AI Quant Support Assistant (`AI_SUPPORT` modal) with smart suggestion chips to guide traders.
- 👥 **Per-User Isolated Workspaces**: Each account receives its own isolated `$100,000.00 USDT` virtual balance, active trades list, and persistent state.

---

## 🌟 Key Features

### 1. ⚡ High-Frequency Spatial Arbitrage Scanner
- **Multi-Exchange Feeders**: Live price tick streaming across **Binance**, **Bybit**, **OKX**, and **Coinbase**.
- **Real-Time Spread Calculation**: Instant calculation of spatial price discrepancies, gross profits, estimated gas fees, and net arbitrage yield.
- **One-Click Manual Execution**: Instant execution of spatial arbitrage routes (`Buy Exchange ➔ Sell Exchange`).

### 2. 🤖 Autonomous Trading AI Engine
- **Master Autopilot Switch**: Enable/disable automated bot execution with customizable strategy modes (*Aggressive*, *Balanced*, *Conservative*).
- **Min Profit Threshold Slider**: Fine-tune minimum profit targets (`0.10% - 2.00%`) before the bot executes spatial routes.
- **Live System Health**: API latency monitoring (`14ms`), ping telemetry, and rate limit tracking across exchange gateways.

### 3. 💼 Paper Trading Wallet & Live Position Settlement
- **Virtual Cash Balance**: Pre-funded `$100,000.00 USDT` virtual paper wallet with interactive deposit modal (`+$1k`, `+$5k`, `+$10k`, `+$50k`).
- **Dynamic Asset Cards**: Real-time calculated portfolio holdings (**BTC**, **ETH**, **SOL**) formatted in standard `en-US` financial notation (`$499,747.89`).
- **Auto-Settlement Engine**: Live open positions update in real-time with automatic profit-taking settlement when targets are reached.

### 4. 🔐 Firebase & GitHub OAuth Authentication
- **Multi-Factor Auth Flow**: Email/password authentication integrated with Firebase Auth SDK.
- **GitHub OAuth Provider**: Seamless sign-in with **GitHub** (`Continue with GitHub` 🐙).
- **1-Click Instant Demo**: Instant 1-click access for lead quantitative trader **Deepak Kumar**.

### 5. 🎨 Chainblock Dark Glassmorphic Design System
- **Obsidian Dark Aesthetic**: Custom glassmorphism UI with translucent card backdrops (`rgba(22, 26, 35, 0.85)`), `#34d399` emerald green accents, and particle canvas background.
- **Web Audio Sound Effects**: Synthesized Web Audio chimes for trade execution, position closures, and system alerts.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://reactjs.org/) + [Vite 5](https://vitejs.dev/) |
| **Styling & Design** | [TailwindCSS](https://tailwindcss.com/) + Custom Glassmorphism CSS Tokens |
| **State Management** | React Context API (`CryptoContext.jsx`) |
| **Data Visualization** | [Recharts](https://recharts.org/) (Interactive Sparklines & Area Analytics) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/) & GitHub OAuth |
| **Icons & Micro-UI** | [Lucide React](https://lucide.dev/) + Canvas Confetti |
| **Audio Engine** | Web Audio API (Synthesized Oscillators) |
| **Deployment** | GitHub Pages (`gh-pages`) & Firebase Hosting |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AGzDeepak/tradebot.git
cd tradebot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Deploy Live to GitHub Pages
```bash
npm run deploy
```

### Deploy to Firebase Hosting
```bash
npx firebase-tools login
npx firebase-tools deploy
```

---

## 📂 Project Structure

```
tradebot/
├── src/
│   ├── components/
│   │   ├── AiStrategyPanel.jsx     # AI Trading Bot Strategies
│   │   ├── ArbitragePanel.jsx     # Spatial Arbitrage Scanner Matrix
│   │   ├── AuthScreen.jsx         # Firebase & GitHub Auth Screen
│   │   ├── AutoTraderBar.jsx      # Master Bot Autopilot Control
│   │   ├── ExchangeStatus.jsx     # API Telemetry & Latency Health
│   │   ├── GlobalModals.jsx       # Wallet, Deposit & Notification Modals
│   │   ├── Header.jsx             # Search & Deepak Kumar Profile Badge
│   │   ├── LiveChart.jsx          # Recharts Market Analytics Area Chart
│   │   ├── LivePositions.jsx      # Active Open Arbitrage Positions
│   │   ├── OperationSwapTool.jsx  # Buy / Sell / Exchange Swap Tool
│   │   ├── PaperTradingPanel.jsx  # Paper Wallet Execution & Presets
│   │   ├── Sidebar.jsx            # Chainblock Navigation & Logo
│   │   ├── TotalAssetsHero.jsx    # Hero Total Balance & Dynamic Sparklines
│   │   └── TransactionsWidget.jsx # Recent Settlement Transactions
│   ├── config/
│   │   └── firebase.js            # Firebase App & OAuth Config
│   ├── context/
│   │   └── CryptoContext.jsx      # Master React Context State & WebSocket Stream
│   ├── utils/
│   │   └── audio.js               # Web Audio API Synth Effects
│   ├── App.jsx                    # Root Shell & Route Guard
│   ├── index.css                  # Dark Glassmorphism CSS Utilities
│   └── main.jsx                   # React DOM Entry
├── firebase.json                  # Firebase Hosting Config
├── .firebaserc                    # Firebase Project Alias
├── vite.config.js                 # Vite Base & Build Config
└── package.json                   # Dependencies & Deployment Scripts
```

---

## 👤 Author

**Deepak Kumar**
- **GitHub**: [@AGzDeepak](https://github.com/AGzDeepak)
- **Repository**: [AGzDeepak/tradebot](https://github.com/AGzDeepak/tradebot)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
