# ⚡ CryptoBot AI — Institutional Spatial Arbitrage & Quantitative Trading Terminal

[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Web3](https://img.shields.io/badge/Web3-MetaMask-F6851B.svg?style=for-the-badge&logo=metamask)](https://metamask.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **CryptoBot AI** is an institutional-grade cryptocurrency spatial arbitrage scanner, quantitative automated trading engine, and analytics terminal. Powered by a **Python 3.14 FastAPI backend**, **React 18 frontend**, **Multi-Channel Real Payment Gateway**, and **Firebase Firestore** persistence.

---

## 🌐 Live Production & Deployment Links

- **🚀 Live Firebase App**: [https://tradebot-25d4f.web.app](https://tradebot-25d4f.web.app)
- **📦 GitHub Repository Primary**: [https://github.com/AGzDeepak/crypto_tradingbot](https://github.com/AGzDeepak/crypto_tradingbot)
- **📦 GitHub Repository Secondary**: [https://github.com/AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)
- **🐍 Local Python FastAPI Server**: [http://localhost:8000](http://localhost:8000)
- **📚 Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **🔥 Firebase Console**: [https://console.firebase.google.com/project/tradebot-25d4f/overview](https://console.firebase.google.com/project/tradebot-25d4f/overview)

---

## ✨ Recent Updations & Key Features

### 1. 💳 Multi-Channel Real Payment Gateway (`RealPaymentGatewayModal.jsx`)
- **Web3 Direct On-Chain Gateway (`window.ethereum`)**: Direct EIP-1193 transaction signing with real-time block explorer TxHash links (*Etherscan, Arbiscan, Polygonscan, BSCScan*).
- **Stripe Credit / Debit Card Gateway**: Interactive 3D credit card visual with brand detection (Visa/Mastercard/Amex), **Stripe Sandbox Autofill Test Card (`4242 4242 4242 4242`)**, **3D-Secure 6-Digit Bank OTP Authorization**, and digital receipts.
- **Instant Crypto QR Code Gateway**: Dynamic QR code generator and deposit address copier for *Arbitrum One, Ethereum, USDT-TRC20, BNB Chain, and Solana*.
- **Bank Wire & Instant UPI Gateway**: Beneficiary SWIFT/IBAN details and bank UTR reference verification.

### 2. 🤖 Realigned Autopilot Quant Command Deck (`AutoTraderBar.jsx` & `backend/bot.py`)
- **Full-Width 4-Column Control Grid**: Clean layout containing *Execution Engine Mode*, *Trading Strategy Profile*, *Min Profit Target Slider*, and *Risk Limits (Target Stop & Stop Loss)*.
- **Header Balance & Telemetry**: Real-time display of Bot Cumulative Profit, Wallet Balance, and live execution terminal.

### 3. 🛡️ Account Compliance, Active Sessions & Tax Center (`AccountSection.jsx`)
- **Institutional Operational Limits**: Daily withdrawal limits ($5,000,000 USDT cap), single-trade caps, and KYC Tier 3 verification badge.
- **Active Login Sessions Audit**: Real-time list of active connected devices (Browser, MetaMask Extension, Mobile App) with IP, location, and **Revoke Access** button.
- **Tax & Audit Export Center**: One-click download buttons for *Annual Tax Statements (CSV)*, *Monthly Arbitrage Summaries (PDF)*, and *On-Chain Execution Audit Logs*.

### 4. 🛍️ Dedicated Paper Trading Terminal (`PaperTradingPanel.jsx`)
- Virtual $100k paper trading execution across *Binance Pro, Bybit Quant, OKX, Coinbase Pro* with quick percentage position sizing (`25%`, `50%`, `75%`, `100% MAX`).

### 5. 🐍 100% Python Backend & Terminal CLI (`main.py` & `cli_dashboard.py`)
- **Python FastAPI REST API Engine**: Complete backend endpoints for trading, market ticks, swap tool, web3 verification, news scraping, and payment processing.
- **Interactive Python CLI Console**: Run full trading engine terminal interface via `python cli_dashboard.py`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Python Backend Engine** | [Python 3.14](https://www.python.org/) + [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) + [Pydantic](https://pydantic.dev/) |
| **Web Scraper** | [BeautifulSoup4 (bs4)](https://www.crummy.com/software/BeautifulSoup/) + `requests` |
| **Frontend Framework** | [React 18.2](https://reactjs.org/) + [Vite 5.4](https://vitejs.dev/) |
| **Styling & Design** | [TailwindCSS 3.4](https://tailwindcss.com/) + Institutional Dark Theme |
| **Web3 & Blockchain** | EIP-1193 Provider + MetaMask Direct RPC (`web3Service.js`) |
| **Database & Auth** | [Firebase Auth](https://firebase.google.com/) & [Firestore Database](https://firebase.google.com/docs/firestore) |
| **Deployments** | Firebase Hosting & GitHub Repositories |

---

## 🚀 Local Installation & Execution

### Prerequisites
- Node.js `v18.0.0` or higher
- Python `v3.10` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AGzDeepak/crypto_tradingbot.git
cd crypto_tradingbot
```

### 2. Run Main Python Application Launcher
```bash
python main.py
```
*Automatically installs Python dependencies and starts FastAPI server on http://localhost:8000*

### 3. Run Interactive Python CLI Terminal Console
```bash
python cli_dashboard.py
```

### 4. Run React Web Application
```bash
npm install
npm run dev
```
*Web Application running at http://localhost:3000*

---

## 📂 Project Structure Map

```
crypto_tradingbot/
├── backend/
│   ├── bot.py                        # Python Autonomous Quant Bot Engine
│   ├── firebase_config.py            # Python Firebase Admin SDK Integration
│   ├── market_generator.py           # NumPy Market Ticks & Indicator Generator
│   ├── scraper.py                    # BeautifulSoup4 (bs4) Crypto News Scraper
│   ├── server.py                     # FastAPI REST API Server & Payment Endpoints
│   ├── swap_tool.py                  # Python Liquidity Swap Engine
│   ├── trading_engine.py             # Python Datastore, Positions & Wallet Manager
│   └── web3_engine.py                # Python EVM Address & Network Verifier
├── src/
│   ├── components/
│   │   ├── AccountSection.jsx         # Account Limits, Sessions & Tax Export Center
│   │   ├── AddApiKeyModal.jsx         # Exchange API Key Connection Form Modal
│   │   ├── AnalyticsSection.jsx       # Quant Performance & Win Rate Analytics
│   │   ├── ArbitragePanel.jsx         # Spatial Arbitrage Scanner Matrix
│   │   ├── AutoTraderBar.jsx          # Master Bot Autopilot Command Deck
│   │   ├── GlobalModals.jsx           # Modal Manager & Wallet Operations
│   │   ├── Header.jsx                 # Top Navigation Header & Deposit Button
│   │   ├── LiveCryptoNews.jsx         # Live Crypto News & Fear/Greed Index
│   │   ├── OperationSwapTool.jsx      # Manual Buy/Sell Swap Form
│   │   ├── PaperTradingPanel.jsx      # Standalone Mock Paper Trading Terminal
│   │   ├── RealPaymentGatewayModal.jsx# Multi-Channel Payment Gateway Modal
│   │   ├── Sidebar.jsx                # Navigation Sidebar
│   │   ├── TotalAssetsHero.jsx        # Hero Asset Balances Breakdown
│   │   ├── TradeHistory.jsx           # Quantitative Trade Audit Log Ledger
│   │   ├── WalletSection.jsx          # Institutional Wallet Section
│   │   └── YellowPortfolioCard.jsx    # Yellow Reference Portfolio Card
│   ├── config/
│   │   └── firebase.js                # Firebase App, Auth & Firestore Config
│   ├── context/
│   │   └── CryptoContext.jsx          # Master React Application State
│   ├── services/
│   │   ├── apiService.js              # Python FastAPI REST Client
│   │   └── web3Service.js             # EIP-1193 Web3 Provider Integration
│   ├── App.jsx                        # Main Application Shell
│   ├── index.css                      # Institutional Dark Theme Utilities
│   └── main.jsx                       # React Entry Point
├── cli_dashboard.py                   # Interactive Python CLI Terminal Console
├── main.py                            # Main Python Application Entry Launcher
├── firebase.json                      # Firebase Hosting Configuration
└── README.md                          # Comprehensive Project Documentation
```

---

## 👤 Author & Repositories

**Deepak Kumar**
- **GitHub**: [@AGzDeepak](https://github.com/AGzDeepak)
- **Primary Repository**: [AGzDeepak/crypto_tradingbot](https://github.com/AGzDeepak/crypto_tradingbot)
- **Secondary Repository**: [AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)
- **Live Firebase Application**: [https://tradebot-25d4f.web.app](https://tradebot-25d4f.web.app)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
