"""
CryptoBot AI — Institutional Python Quant Engine & FastAPI Backend Server
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, FastAPI, Uvicorn, Pydantic, NumPy, BeautifulSoup4, Firebase Admin SDK
"""

import math
import time
import random
import secrets
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from scraper import scrape_crypto_news
from bot import python_quant_bot
from firebase_config import python_firebase
from trading_engine import python_trading_engine

try:
    from fastapi import FastAPI, HTTPException, Depends, Header
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    import sys
    import subprocess
    print("Installing FastAPI and Uvicorn dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "pydantic", "beautifulsoup4", "requests"])
    from fastapi import FastAPI, HTTPException, Depends, Header
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn

# Initialize FastAPI App
app = FastAPI(
    title="CryptoBot AI — Python Quant Arbitrage & Trading Engine",
    description="High-frequency Spatial Arbitrage API, Order Execution Engine, BeautifulSoup Web Scraper & Autonomous Bot powered by Python 3.14 & FastAPI",
    version="3.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC REQUEST MODELS ---

class LoginRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    name: str = Field(default="Deepak Kumar")
    provider: str = Field(default="python_fastapi")

class DepositRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    amount: float = Field(default=1000.0)
    currency: str = Field(default="USDT")

class WithdrawRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    name: str = Field(default="Deepak Kumar")
    amount: float = Field(default=500.0)
    currency: str = Field(default="USDT")
    destinationAddress: str = Field(default="0x71C765b28F3D140a831C28190d7B41")
    networkChain: str = Field(default="Arbitrum One")
    walletMode: str = Field(default="DEMO")

class OrderRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    side: str = Field(default="BUY")
    symbol: str = Field(default="BTCUSDT")
    exchange: str = Field(default="Binance")
    amount: float = Field(default=0.01)
    currentPrice: float = Field(default=67840.50)

class ClosePositionRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    positionId: str
    finalPnL: Optional[float] = None

class AutoTradeRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    opp: Dict

INITIAL_COINS = [
    {"symbol": "BTCUSDT", "name": "Bitcoin", "basePrice": 67840.50, "vol": "4.82B", "high24": 68920.00, "low24": 66500.00, "change24": 2.45},
    {"symbol": "ETHUSDT", "name": "Ethereum", "basePrice": 3540.20, "vol": "2.15B", "high24": 3620.50, "low24": 3480.00, "change24": 1.82},
    {"symbol": "SOLUSDT", "name": "Solana", "basePrice": 184.75, "vol": "1.42B", "high24": 191.00, "low24": 178.50, "change24": 4.12},
    {"symbol": "AVAXUSDT", "name": "Avalanche", "basePrice": 38.60, "vol": "620M", "high24": 40.20, "low24": 36.80, "change24": -0.95},
    {"symbol": "XRPUSDT", "name": "Ripple", "basePrice": 0.6240, "vol": "890M", "high24": 0.6510, "low24": 0.6020, "change24": 3.10},
    {"symbol": "LINKUSDT", "name": "Chainlink", "basePrice": 18.25, "vol": "410M", "high24": 19.10, "low24": 17.60, "change24": 2.05}
]

EXCHANGES = ["Binance", "Bybit", "OKX", "Coinbase"]

def compute_spatial_arbitrage() -> List[Dict]:
    opps = []
    for coin in INITIAL_COINS:
        sym = coin["symbol"]
        base_p = coin["basePrice"]
        
        ex_prices = {}
        for idx, ex in enumerate(EXCHANGES):
            spread = (math.sin(time.time() + idx * 1.5) * 0.002) + (random.uniform(-0.003, 0.003))
            ex_prices[ex] = round(base_p * (1 + spread), 4 if base_p < 10 else 2)
            
        sorted_ex = sorted(ex_prices.items(), key=lambda x: x[1])
        min_ex, min_p = sorted_ex[0]
        max_ex, max_p = sorted_ex[-1]
        
        diff_usd = round(max_p - min_p, 4 if base_p < 10 else 2)
        diff_pct = round((diff_usd / min_p) * 100, 2)
        
        unit_size = 0.05 if "BTC" in sym else 0.5 if "ETH" in sym else 10.0
        gross_profit = round(diff_usd * unit_size, 2)
        est_fees = round((min_p * unit_size + max_p * unit_size) * 0.0004, 2)
        net_profit = round(gross_profit - est_fees, 2)
        
        is_profitable = diff_pct >= 0.20 and net_profit > 0.50
        
        opps.append({
            "symbol": sym,
            "name": coin["name"],
            "buyExchange": min_ex,
            "sellExchange": max_ex,
            "ex1Price": min_p,
            "ex2Price": max_p,
            "diffUsd": diff_usd,
            "diffPct": diff_pct,
            "estProfit": gross_profit,
            "fees": est_fees,
            "netProfit": net_profit,
            "isProfitable": is_profitable,
            "unitSize": unit_size,
            "status": "HIGH PROFIT" if is_profitable else "MONITORING"
        })
        
    return opps

# --- REST API ENDPOINTS ---

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "engine": "Python 3.14 FastAPI Quant Server Engine",
        "quantTrader": "Deepak Kumar",
        "systemTime": datetime.now().isoformat(),
        "totalBotProfit": python_quant_bot.total_bot_profit
    }

@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "engine": "Python FastAPI Quant Engine",
        "exchanges": {
            "Binance": {"ping": "14ms", "status": "ONLINE"},
            "Bybit": {"ping": "22ms", "status": "ONLINE"},
            "OKX": {"ping": "28ms", "status": "ONLINE"},
            "Coinbase": {"ping": "36ms", "status": "ONLINE"}
        }
    }

@app.get("/api/market/prices")
def get_market_prices():
    arbitrage_opps = compute_spatial_arbitrage()
    return {
        "timestamp": datetime.now().isoformat(),
        "coins": INITIAL_COINS,
        "arbitrageOpportunities": arbitrage_opps,
        "totalOpportunities": len(arbitrage_opps)
    }

@app.get("/api/user/workspace")
def get_user_workspace(email: str = "deepak@chainblock.io", name: str = "Deepak Kumar"):
    return python_trading_engine.get_or_create_user(email, name)

@app.post("/api/wallet/deposit")
def deposit_wallet(req: DepositRequest):
    res = python_trading_engine.deposit_funds(req.email, req.amount, req.currency)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/api/wallet/withdraw")
def withdraw_wallet(req: WithdrawRequest):
    res = python_trading_engine.withdraw_funds(
        req.email, req.amount, req.destinationAddress, req.currency, req.networkChain, req.walletMode
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    
    python_firebase.record_withdrawal(res["record"])
    return res

@app.post("/api/trade/execute")
def execute_trade_order(req: OrderRequest):
    res = python_trading_engine.execute_order(
        req.email, req.side, req.symbol, req.exchange, req.amount, req.currentPrice
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/api/trade/close")
def close_trade_position(req: ClosePositionRequest):
    res = python_trading_engine.close_position(req.email, req.positionId, req.finalPnL)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.post("/api/bot/auto-trade")
def run_bot_auto_trade(req: AutoTradeRequest):
    res = python_trading_engine.execute_auto_arbitrage(req.email, req.opp)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@app.get("/api/news/scrape")
def get_scraped_news():
    news_items = scrape_crypto_news()
    return {
        "status": "SUCCESS",
        "scraperEngine": "BeautifulSoup4 (bs4)",
        "timestamp": datetime.now().isoformat(),
        "totalArticles": len(news_items),
        "news": news_items
    }

if __name__ == "__main__":
    print("Starting Python Quant FastAPI Server on http://localhost:8000 ...")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
