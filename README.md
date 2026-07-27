# ⚡ CryptoBot AI — Institutional Spatial Arbitrage & Quantitative Trading Terminal

[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![BeautifulSoup4](https://img.shields.io/badge/BeautifulSoup4-bs4-4A154B.svg?style=for-the-badge)](https://www.crummy.com/software/BeautifulSoup/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Web3](https://img.shields.io/badge/Web3-MetaMask-F6851B.svg?style=for-the-badge&logo=metamask)](https://metamask.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **CryptoBot AI** is an institutional-grade cryptocurrency spatial arbitrage scanner, quantitative automated trading engine, and analytics terminal. Powered by a **Python 3.14 FastAPI backend**, **BeautifulSoup4 (bs4) web scraper**, **React 18 frontend**, **True Japanese Financial Market Candlesticks (OHLC)**, and real-time **Firebase Firestore** database logging.

---

## 🚀 Live Production & Server Access

- **🌐 Live Web Terminal**: [https://tradebot-25d4f.web.app](https://tradebot-25d4f.web.app)
- **📦 GitHub Repository**: [https://github.com/AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)
- **🐍 Local Python FastAPI API**: [http://localhost:8000](http://localhost:8000)
- **📚 Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **🔥 Firebase Console**: [https://console.firebase.google.com/project/tradebot-25d4f/overview](https://console.firebase.google.com/project/tradebot-25d4f/overview)

---

## 🌟 Key Architecture & Recent Feature Additions

### 1. 🐍 Python 3.14 FastAPI Quant Engine & BeautifulSoup4 Scraper (`backend/`)
- **FastAPI API Server (`backend/server.py`)**: High-frequency REST endpoints for live spatial prices, authentication, bot execution, and withdrawals.
- **BeautifulSoup4 Scraper (`backend/scraper.py`)**: Scrapes real-time crypto headlines, market sentiment tags (*HIGH PROFIT*, *BULLISH*, *NEUTRAL*), and spatial arbitrage news feeds.
- **Autonomous Bot Engine (`backend/bot.py`)**: NumPy vector math and spatial route evaluation engine.
- **Firebase Admin SDK (`backend/firebase_config.py`)**: Python backend datastore persistence.

### 2. 📊 Quantitative Trade Audit Log with Full Buy & Sell Leg Info (`TradeHistory.jsx`)
- **Full Leg Breakdown**: Displays exact **Buy Leg** (exchange, entry price) vs **Sell Leg** (exchange, exit price), traded volume, capital outflow/inflow, and net realized profit.
- **Expandable Orderbook Detail Drawer**: Click any trade row to open an inline orderbook breakdown comparing Leg 1 and Leg 2 side-by-side with transaction hashes (`0x8f2a...39b1`) and execution latency (`14.2ms`).
- **Bot Cumulative Profit Metric Card**: Dedicated `[ 🤖 AI BOT CUM. PROFIT: +$1,248.50 ]` card and `[ 🤖 FILTER BOT TRADES ]` toggle button.
- **Export Capabilities**: Working **CSV**, **Excel**, and **PDF Ledger** export features.

### 3. 🤖 Bot Cumulative Profit Wallet Integration
- **Prominent Wallet Badge**: Displayed in `TotalAssetsHero.jsx` (`[ 🤖 BOT CUMULATIVE PROFIT: +$1,248.50 ]`), `PaperTradingPanel.jsx`, and `GlobalModals.jsx`.
- **Automatic Balance Growth**: Bot execution yields automatically credit to available cash and total equity.

### 4. 🕯️ True Financial Japanese Market Candlesticks (OHLC) in Analytics (`LiveChart.jsx`)
- **Custom SVG Candlestick Engine**: Renders true **Open, High, Low, Close (OHLC)** Japanese market candlesticks.
- **Bullish Green Candles (`#34d399`)**: Rendered when `close >= open`.
- **Bearish Red Candles (`#f43f5e`)**: Rendered when `close < open`.
- **Ticker Metric Bar**: Displays live `OPEN`, `HIGH`, `LOW`, `CLOSE`, and `VOLUME` values for `BTC/USDT`, `ETH/USDT`, `SOL/USDT`, and `AVAX/USDT`.

### 5. 🗄️ Firebase Firestore Real-Time Database Logging
- **`login_logs` Collection**: 256-bit AES encrypted login audit trail with server timestamps.
- **`users` Collection**: Manages user profiles and trader roles.
- **`withdrawals` Collection**: Records withdrawal transactions with destination addresses, network chains, amounts, and hashes.
- **`bot_trade_logs` Collection**: Stores AI Bot executions and cumulative profit milestones directly in Firestore.

---

## 🛠️ Technology Stack Matrix

| Architecture Layer | Technology |
| :--- | :--- |
| **Python Backend Engine** | [Python 3.14](https://www.python.org/) + [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) |
| **Web Scraper** | [BeautifulSoup4 (bs4)](https://www.crummy.com/software/BeautifulSoup/) + `requests` |
| **Quant Vector Math** | [NumPy](https://numpy.org/) |
| **Core Frontend** | [React 18.2](https://reactjs.org/) + [Vite 5.4](https://vitejs.dev/) |
| **Styling System** | [TailwindCSS 3.4](https://tailwindcss.com/) + Obsidian Dark Glassmorphic Tokens |
| **Web3 & Blockchain** | EIP-1193 Provider + MetaMask Integration (`web3Service.js`) |
| **Database & Auth** | [Firebase Auth](https://firebase.google.com/) & [Firestore Real-Time Database](https://firebase.google.com/docs/firestore) |
| **Analytics & Candles** | Custom SVG Candlestick Engine + [Recharts](https://recharts.org/) |
| **Audio Processing** | Web Audio API Synthesizer (`audio.js`) |
| **Deployments** | Firebase Hosting & GitHub Pages |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- Python `v3.10` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/AGzDeepak/cryptobot.git
cd cryptobot
```

### 2. Install Frontend & Python Dependencies
```bash
npm install
pip install -r backend/requirements.txt
```

### 3. Run Local Servers

**Terminal 1 — Python FastAPI Backend Server**:
```bash
python backend/server.py
```
*API running at http://localhost:8000*

**Terminal 2 — React Frontend Dev Server**:
```bash
npm run dev
```
*Web App running at http://localhost:3000*

---

## 📂 Project Directory Map

```
cryptobot/
├── backend/
│   ├── bot.py                # Python Autonomous Quant Bot Engine
│   ├── firebase_config.py    # Python Firebase Admin SDK Integration
│   ├── requirements.txt      # Python Package Manifest
│   ├── scraper.py            # BeautifulSoup4 (bs4) Crypto News Scraper
│   └── server.py             # FastAPI REST Server & Endpoints
├── src/
│   ├── components/
│   │   ├── AnalyticsSection.jsx   # Quant Performance & Win Rate Analytics
│   │   ├── ArbitragePanel.jsx     # Spatial Arbitrage Scanner Matrix
│   │   ├── AutoTraderBar.jsx      # Master Bot Autopilot Control
│   │   ├── GlobalModals.jsx       # Wallet, Deposit, Withdraw & Firestore History
│   │   ├── LiveChart.jsx          # True Market Candlesticks (OHLC) & Metric Bar
│   │   ├── OperationSwapTool.jsx  # Manual Buy/Sell Swap Tool
│   │   ├── PaperTradingPanel.jsx  # Paper Wallet Execution & Bot Profit Card
│   │   ├── TotalAssetsHero.jsx    # Hero Balance & Bot Cum. Profit Badge
│   │   └── TradeHistory.jsx       # Quantitative Trade Audit Log (Buy & Sell Leg Info)
│   ├── config/
│   │   └── firebase.js            # Firebase App, Auth & Firestore Config
│   ├── context/
│   │   └── CryptoContext.jsx      # Master React Application Context
│   ├── services/
│   │   ├── pythonQuantService.js  # React Bridge to Python FastAPI & bs4 Scraper
│   │   ├── securityService.js     # Firestore Audit & Withdrawal Log Helpers
│   │   └── web3Service.js         # Real Web3 Wallet & MetaMask Integration
│   ├── App.jsx                    # Root Shell Component
│   ├── index.css                  # Obsidian Dark Glassmorphic CSS Engine
│   └── main.jsx                   # React DOM Entry
├── firebase.json                  # Firebase Hosting Config
└── README.md                      # Institutional Project Documentation
```

---

## 👤 Author

**Deepak Kumar**
- **GitHub**: [@AGzDeepak](https://github.com/AGzDeepak)
- **Repository**: [AGzDeepak/trading_cryptobot](https://github.com/AGzDeepak/trading_cryptobot)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
