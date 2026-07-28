# ⚡ CryptoBot AI — Institutional Spatial Arbitrage & Quantitative Trading Terminal

[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Web3](https://img.shields.io/badge/Web3-MetaMask-F6851B.svg?style=for-the-badge&logo=metamask)](https://metamask.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **CryptoBot AI** is an institutional-grade cryptocurrency spatial arbitrage scanner, quantitative automated trading engine, and analytics terminal. Powered by a **Python 3.14 FastAPI backend**, **React 18 frontend**, **True Financial Candlesticks (OHLC)**, and real-time **Firebase Firestore** persistence.

---

## 🌐 Live Production & Deployment Links

- **🚀 Live Firebase App**: [https://tradebot-25d4f.web.app](https://tradebot-25d4f.web.app)
- **📦 GitHub Repository Primary**: [https://github.com/AGzDeepak/crypto_tradingbot](https://github.com/AGzDeepak/crypto_tradingbot)
- **📦 GitHub Repository Secondary**: [https://github.com/AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)
- **🐍 Local Python FastAPI Server**: [http://localhost:8000](http://localhost:8000)
- **📚 Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **🔥 Firebase Console**: [https://console.firebase.google.com/project/tradebot-25d4f/overview](https://console.firebase.google.com/project/tradebot-25d4f/overview)

---

## ✨ Complete Web Application Features & Architecture

### 1. 🤖 Autopilot Quant Command Deck (`AutoTraderBar.jsx` & `backend/bot.py`)
- **Automated Spatial Arbitrage**: Scans spatial price discrepancies across Binance, Bybit, OKX, and Coinbase.
- **Configurable Risk Profiles**: Balanced Yield, Aggressive Arbitrage, and Conservative Safe Guard modes.
- **Min Profit Threshold**: Real-time slider adjustments from 0.10% to 1.00%.

### 2. 🛍️ Dedicated Standalone Paper Trading Section (`PaperTradingPanel.jsx`)
- **Top-Level Navigation Item**: Accessible as a primary section from the left navigation sidebar.
- **Virtual $100k Sandbox Execution**: BUY (LONG) and SELL (SHORT) order placement with target exchange selection (*Binance Pro, Bybit Quant, OKX, Coinbase Pro*).
- **Quick Percentage Size Bar**: Select position size instantly (`25%`, `50%`, `75%`, `100% MAX`).
- **Responsive Layout**: Spreads onto clean 2-column & 4-column cards on all screens with zero text truncation.

### 3. 🔑 Multi-Exchange Quant API Matrix (`AccountSection.jsx` & `AddApiKeyModal.jsx`)
- **Add API Key Modal Form**: Dedicated form supporting *Binance Pro, Bybit Quant, OKX Institutional, Coinbase Pro, KuCoin, and Kraken*.
- **Interactive Security Safeguards**: Public API key, masked secret input, IP whitelist restriction, 2FA toggle, and IP Auto-Lock Guard.
- **Dynamic State Matrix**: Connected keys automatically update the active exchange connection matrix in real time.

### 4. 📰 True Live Crypto News & AI Market Intelligence (`LiveCryptoNews.jsx`)
- **Real-Time Streaming News**: Headlines with category pills (`QUANT ARBITRAGE`, `MACRO`, `ETFS & INSTITUTIONAL`, `LAYER 2 & DEFI`).
- **Crypto Fear & Greed Index**: Displays real-time market sentiment (`84 / 100 EXTREME GREED`).
- **AI Price Impact Badges**: Calculates predicted market movement (`+4.8% BTC/USDT`, `+7.8% SOL/USDT`).

### 5. 💳 Institutional Wallet & Web3 Integration (`WalletSection.jsx`)
- **Dual Wallet Mode**: Seamlessly toggle between **DEMO $100k Paper Wallet** and **REAL Web3 MetaMask Wallet**.
- **Working Quick Withdraw Form**: Complete with destination crypto address input, network selector (*Arbitrum One, Ethereum Mainnet, Polygon*), and real-time Firestore database logging.
- **Asset Balances Breakdown**: Live tracking for 6 major cryptocurrencies (USDT, BTC, ETH, SOL, AVAX, XRP).

### 6. 🎨 Premium Obsidian Glassmorphic UI Aesthetic
- Dark charcoal obsidian theme (`#0b0c10`) with yellow crescent brand emblem.
- Bright yellow **My Portfolio Card** (`YellowPortfolioCard.jsx`) with percentage badges.
- Glowing **Gold SVG Main Chart** (`LiveChart.jsx`) with time interval filters (`1h`, `3h`, `1d`, `1w`, `1m`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Python Backend Engine** | [Python 3.14](https://www.python.org/) + [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) |
| **Web Scraper** | [BeautifulSoup4 (bs4)](https://www.crummy.com/software/BeautifulSoup/) + `requests` |
| **Frontend Framework** | [React 18.2](https://reactjs.org/) + [Vite 5.4](https://vitejs.dev/) |
| **Styling & Design** | [TailwindCSS 3.4](https://tailwindcss.com/) + Obsidian Dark Glassmorphism |
| **Web3 & Blockchain** | EIP-1193 Provider + MetaMask Integration (`web3Service.js`) |
| **Database & Auth** | [Firebase Auth](https://firebase.google.com/) & [Firestore Database](https://firebase.google.com/docs/firestore) |
| **Deployments** | Firebase Hosting & GitHub Pages |

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- Python `v3.10` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AGzDeepak/crypto_tradingbot.git
cd crypto_tradingbot
```

### 2. Install Frontend & Python Dependencies
```bash
npm install
pip install -r backend/requirements.txt
```

### 3. Run Development Servers

**Terminal 1 — Python FastAPI Backend**:
```bash
python backend/server.py
```
*Backend API running at http://localhost:8000*

**Terminal 2 — React Vite Frontend**:
```bash
npm run dev
```
*Frontend Application running at http://localhost:3000*

---

## 📂 Project Structure Map

```
crypto_tradingbot/
├── backend/
│   ├── bot.py                # Python Autonomous Quant Bot Engine
│   ├── firebase_config.py    # Python Firebase Admin SDK Integration
│   ├── requirements.txt      # Python Package Manifest
│   ├── scraper.py            # BeautifulSoup4 (bs4) Crypto News Scraper
│   └── server.py             # FastAPI REST Server & Endpoints
├── src/
│   ├── components/
│   │   ├── AccountSection.jsx     # Professional Account Management & VIP Tier Badge
│   │   ├── AddApiKeyModal.jsx     # Exchange API Key Connection Form Modal
│   │   ├── AnalyticsSection.jsx   # Quant Performance & Win Rate Analytics
│   │   ├── ArbitragePanel.jsx     # Spatial Arbitrage Scanner Matrix
│   │   ├── AutoTraderBar.jsx      # Master Bot Autopilot Command Deck
│   │   ├── GlobalModals.jsx       # Modal Manager & Wallet Operations
│   │   ├── Header.jsx             # Top Command Header & Dynamic Tab Title
│   │   ├── LiveChart.jsx          # Gold SVG Financial Chart (OHLC Candlesticks)
│   │   ├── LiveCryptoNews.jsx     # True Live Crypto News Feed & Fear/Greed Index
│   │   ├── OperationSwapTool.jsx  # Manual Buy/Sell Swap Form
│   │   ├── PaperTradingPanel.jsx  # Standalone Mock Paper Trading Terminal
│   │   ├── Sidebar.jsx            # Top-Level Sidebar Navigation Items
│   │   ├── TotalAssetsHero.jsx    # Hero Balance & Bot Cum. Profit Badge
│   │   ├── TradeHistory.jsx       # Quantitative Trade Audit Log Ledger
│   │   ├── WalletSection.jsx      # Institutional Wallet & Quick Withdraw Form
│   │   └── YellowPortfolioCard.jsx# Yellow Reference Portfolio Card
│   ├── config/
│   │   └── firebase.js            # Firebase App, Auth & Firestore Config
│   ├── context/
│   │   └── CryptoContext.jsx      # Master React Application Context
│   ├── App.jsx                    # Application Shell & Tab Routing
│   ├── index.css                  # Obsidian Dark Theme Design Tokens & Utilities
│   └── main.jsx                   # React Entry Point
├── firebase.json                  # Firebase Hosting Deployment Configuration
└── README.md                      # Comprehensive Project Documentation
```

---

## 👤 Author

**Deepak Kumar**
- **GitHub**: [@AGzDeepak](https://github.com/AGzDeepak)
- **Primary Repository**: [AGzDeepak/crypto_tradingbot](https://github.com/AGzDeepak/crypto_tradingbot)
- **Secondary Repository**: [AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
