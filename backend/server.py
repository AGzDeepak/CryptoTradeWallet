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
from market_generator import python_market_engine
from web3_engine import python_web3_engine
from swap_tool import python_swap_engine, SwapEstimateRequest, SwapExecuteRequest

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
    title="CryptoBot AI — 100% Python Quant Arbitrage & Trading Engine",
    description="High-frequency Spatial Arbitrage API, Swap Engine, Order Execution, Technical Indicators & Autonomous Bot powered by Python 3.14 & FastAPI",
    version="3.8.0"
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

# --- REST API ENDPOINTS ---

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "engine": "Python 3.14 FastAPI 100% Quant Backend Engine",
        "quantTrader": "Deepak Kumar",
        "systemTime": datetime.now().isoformat(),
        "totalBotProfit": python_quant_bot.total_bot_profit
    }

@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "engine": "Python 3.14 FastAPI Quant Engine",
        "exchanges": {
            "Binance": {"ping": "14ms", "status": "ONLINE"},
            "Bybit": {"ping": "22ms", "status": "ONLINE"},
            "OKX": {"ping": "28ms", "status": "ONLINE"},
            "Coinbase": {"ping": "36ms", "status": "ONLINE"}
        }
    }

@app.get("/api/market/prices")
def get_market_prices():
    ticks = python_market_engine.generate_live_ticks()
    arbitrage_opps = python_quant_bot.evaluate_and_execute(ticks["coins"])
    return {
        "timestamp": datetime.now().isoformat(),
        "coins": ticks["coins"],
        "exchangePrices": ticks["exchangePrices"],
        "arbitrageOpportunities": arbitrage_opps,
        "totalOpportunities": len(arbitrage_opps)
    }

@app.get("/api/user/workspace")
def get_user_workspace(email: str = "deepak@chainblock.io", name: str = "Deepak Kumar"):
    return python_trading_engine.get_or_create_user(email, name)

# --- PYTHON SWAP ENGINE ENDPOINTS ---

@app.post("/api/swap/estimate")
def estimate_swap(req: SwapEstimateRequest):
    return python_swap_engine.calculate_estimate(req.payCoin, req.getCoin, req.payAmount)

@app.post("/api/swap/execute")
def execute_swap(req: SwapExecuteRequest):
    res = python_swap_engine.execute_swap(req)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

# --- TRADING & WALLET ENDPOINTS ---

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

class RiskLimitsRequest(BaseModel):
    takeProfitTarget: float = Field(default=500.0)
    stopLossLimit: float = Field(default=150.0)
    maxTradeAllocation: float = Field(default=250.0)

@app.post("/api/bot/risk-limits")
def update_bot_risk_limits(req: RiskLimitsRequest):
    python_quant_bot.set_risk_limits(req.takeProfitTarget, req.stopLossLimit, req.maxTradeAllocation)
    return {
        "status": "SUCCESS",
        "message": "Python Quant Bot risk limits updated",
        "limits": {
            "takeProfitTarget": req.takeProfitTarget,
            "stopLossLimit": req.stopLossLimit,
            "maxTradeAllocation": req.maxTradeAllocation
        }
    }

@app.post("/api/bot/auto-trade")
def run_bot_auto_trade(req: AutoTradeRequest):
    res = python_trading_engine.execute_auto_arbitrage(req.email, req.opp)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

# --- PYDANTIC PAYMENT GATEWAY REQUEST MODELS ---

class StripePaymentRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    cardNumber: str = Field(default="4242 4242 4242 4242")
    cardHolder: str = Field(default="DEEPAK KUMAR")
    amount: float = Field(default=1000.0)
    currency: str = Field(default="USDT")

class Web3PaymentRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    txHash: str = Field(default="0x7a89f2c1b3e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8")
    fromAddress: str = Field(default="0x71C7656EC7ab88b098defB751B7401B5f6d7B41")
    networkChain: str = Field(default="Arbitrum One")
    amountEth: float = Field(default=0.2825)
    amountUsdt: float = Field(default=1000.0)

class QrPaymentRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    selectedChain: str = Field(default="Arbitrum One")
    txHashInput: str = Field(default="0x892a019b87c6d5e4f3a2b1c0")
    amount: float = Field(default=1000.0)
    currency: str = Field(default="USDT")

class BankPaymentRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    utrReference: str = Field(default="UTR920481029384")
    amount: float = Field(default=1000.0)
    currency: str = Field(default="USDT")

@app.post("/api/payment/stripe")
def process_stripe_card_payment(req: StripePaymentRequest):
    res = python_trading_engine.deposit_funds(req.email, req.amount, req.currency)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return {
        "status": "SETTLED",
        "gateway": "Stripe Credit/Debit Card",
        "authorizationCode": f"AUTH-{secrets.randbelow(899999) + 100000}",
        "cardEnding": req.cardNumber.replace(" ", "")[-4:],
        "receipt": {
            "txId": f"TX-STRIPE-{secrets.randbelow(89999999) + 10000000}",
            "amount": req.amount,
            "currency": req.currency,
            "timestamp": datetime.now().isoformat()
        },
        "wallet": res["wallet"]
    }

@app.post("/api/payment/web3")
def process_web3_onchain_payment(req: Web3PaymentRequest):
    res = python_trading_engine.deposit_funds(req.email, req.amountUsdt, "USDT")
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return {
        "status": "SETTLED",
        "gateway": "Direct Web3 On-Chain Wallet",
        "network": req.networkChain,
        "txHash": req.txHash,
        "fromAddress": req.fromAddress,
        "receipt": {
            "txId": req.txHash,
            "amount": req.amountUsdt,
            "currency": "USDT",
            "timestamp": datetime.now().isoformat()
        },
        "wallet": res["wallet"]
    }

@app.post("/api/payment/qr")
def process_crypto_qr_payment(req: QrPaymentRequest):
    res = python_trading_engine.deposit_funds(req.email, req.amount, req.currency)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return {
        "status": "SETTLED",
        "gateway": f"Crypto Transfer ({req.selectedChain})",
        "txHash": req.txHashInput,
        "wallet": res["wallet"]
    }

@app.post("/api/payment/bank")
def process_bank_wire_payment(req: BankPaymentRequest):
    res = python_trading_engine.deposit_funds(req.email, req.amount, req.currency)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return {
        "status": "SETTLED",
        "gateway": "Instant Bank Wire / UPI Transfer",
        "utr": req.utrReference,
        "wallet": res["wallet"]
    }

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
