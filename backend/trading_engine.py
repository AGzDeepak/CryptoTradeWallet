"""
CryptoBot AI — Python Quantitative Trading & Wallet Engine
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, FastAPI, Pydantic, NumPy, Datastore Engine
"""

import time
import random
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

# Base Models
class UserWallet(BaseModel):
    virtualBalance: float = 0.00
    totalEquity: float = 0.00
    todayProfit: float = 0.00
    roiPct: float = 0.00
    address: str = "0x00D3...C43D"
    network: str = "Arbitrum One"
    currency: str = "USD"

class Position(BaseModel):
    id: str
    symbol: str
    type: str  # 'BUY', 'SELL', 'ARBITRAGE'
    buyExchange: str
    sellExchange: str
    entryBuyPrice: float
    entrySellPrice: float
    currentBuyPrice: float
    currentSellPrice: float
    spreadPct: float
    amount: float
    invested: float
    unrealizedPnL: float
    duration: str = "0s"
    timestamp: str
    status: str = "ACTIVE"

class TradeRecord(BaseModel):
    id: str
    time: str
    symbol: str
    strategy: str
    buyExchange: str
    sellExchange: str
    entryPrice: float
    exitPrice: float
    amount: float
    fees: float
    netProfit: float
    result: str  # 'PROFIT' | 'LOSS'

class PythonTradingEngine:
    def __init__(self):
        # In-memory Datastore indexed by clean email
        self.users: Dict[str, Dict] = {}

    def get_or_create_user(self, email: str, name: str = "Trader") -> Dict:
        clean_email = (email or "default@chainblock.io").strip().lower()
        if clean_email not in self.users:
            self.users[clean_email] = {
                "user": {
                    "email": clean_email,
                    "name": name,
                    "id": f"#{random.randint(1000, 9999)}-QUANT-PRO"
                },
                "wallet": {
                    "virtualBalance": 0.00,  # Initial balance starts at $0.00
                    "totalEquity": 0.00,
                    "todayProfit": 0.00,
                    "roiPct": 0.00,
                    "address": "0x00D3...C43D",
                    "network": "Arbitrum One",
                    "currency": "USD"
                },
                "openPositions": [],
                "tradeHistory": [],
                "withdrawalHistory": [],
                "totalBotProfit": 0.00,
                "autoTradeCount": 0
            }
        return self.users[clean_email]

    def deposit_funds(self, email: str, amount: float, currency: str = "USDT") -> Dict:
        if amount <= 0:
            return {"success": False, "message": "Deposit amount must be greater than zero."}

        user_data = self.get_or_create_user(email)
        wallet = user_data["wallet"]
        
        wallet["virtualBalance"] = round(wallet["virtualBalance"] + amount, 2)
        wallet["totalEquity"] = round(wallet["totalEquity"] + amount, 2)

        return {
            "success": True,
            "message": f"Successfully deposited ${amount:,.2f} {currency} into Python wallet balance!",
            "wallet": wallet
        }

    def withdraw_funds(self, email: str, amount: float, destination: str, currency: str = "USDT", network: str = "Arbitrum One", wallet_mode: str = "DEMO") -> Dict:
        if amount <= 0:
            return {"success": False, "message": "Withdrawal amount must be greater than zero."}

        user_data = self.get_or_create_user(email)
        wallet = user_data["wallet"]

        if amount > wallet["virtualBalance"]:
            return {
                "success": False, 
                "message": f"Insufficient funds! Available balance is ${wallet['virtualBalance']:,.2f} USDT."
            }

        wallet["virtualBalance"] = max(0.0, round(wallet["virtualBalance"] - amount, 2))
        wallet["totalEquity"] = max(0.0, round(wallet["totalEquity"] - amount, 2))

        tx_hash = f"0x{random.getrandbits(256):064x}"
        record = {
            "id": f"WTH-{random.randint(1000, 9999)}",
            "amount": amount,
            "currency": currency,
            "address": destination,
            "networkChain": network,
            "walletMode": wallet_mode,
            "txHash": tx_hash,
            "time": time.strftime("%H:%M:%S"),
            "status": "COMPLETED"
        }

        user_data["withdrawalHistory"].insert(0, record)
        return {
            "success": True,
            "message": f"Withdrawal of ${amount:,.2f} {currency} executed by Python Engine!",
            "record": record,
            "wallet": wallet
        }

    def execute_order(self, email: str, side: str, symbol: str, exchange: str, amount: float, current_price: float) -> Dict:
        user_data = self.get_or_create_user(email)
        wallet = user_data["wallet"]
        cost = round(current_price * amount, 2)

        if side.upper() == "BUY" and cost > wallet["virtualBalance"]:
            return {
                "success": False,
                "message": f"Insufficient funds! Order cost is ${cost:,.2f} but available balance is ${wallet['virtualBalance']:,.2f} USDT."
            }

        # Deduct cost on BUY, add cash on SELL
        if side.upper() == "BUY":
            wallet["virtualBalance"] = round(wallet["virtualBalance"] - cost, 2)
        else:
            wallet["virtualBalance"] = round(wallet["virtualBalance"] + cost, 2)

        pos_id = f"POS-{random.randint(1000, 9999)}"
        new_pos = {
            "id": pos_id,
            "symbol": symbol,
            "type": side.upper(),
            "buyExchange": exchange,
            "sellExchange": "Bybit" if exchange == "Binance" else "Binance",
            "entryBuyPrice": current_price,
            "entrySellPrice": round(current_price * 1.004, 2),
            "currentBuyPrice": current_price,
            "currentSellPrice": round(current_price * 1.004, 2),
            "spreadPct": 0.40,
            "amount": amount,
            "invested": cost,
            "unrealizedPnL": round(cost * 0.004, 2),
            "duration": "0s",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "ACTIVE"
        }

        user_data["openPositions"].insert(0, new_pos)
        return {
            "success": True,
            "message": f"Executed {side.upper()} order: {amount} {symbol} @ ${current_price:,.2f} on {exchange}",
            "position": new_pos,
            "wallet": wallet
        }

    def close_position(self, email: str, position_id: str, final_pnl: Optional[float] = None) -> Dict:
        user_data = self.get_or_create_user(email)
        positions = user_data["openPositions"]
        wallet = user_data["wallet"]

        pos = next((p for p in positions if p["id"] == position_id), None)
        if not pos:
            return {"success": False, "message": "Position not found."}

        pnl = final_pnl if final_pnl is not None else pos["unrealizedPnL"]
        invested = pos["invested"]

        # Credit invested capital + PnL back to wallet
        wallet["virtualBalance"] = round(wallet["virtualBalance"] + invested + pnl, 2)
        wallet["totalEquity"] = round(wallet["totalEquity"] + pnl, 2)
        wallet["todayProfit"] = round(wallet["todayProfit"] + pnl, 2)
        
        if wallet["totalEquity"] > 0:
            wallet["roiPct"] = round((wallet["todayProfit"] / wallet["totalEquity"]) * 100, 2)

        history_item = {
            "id": f"TRD-{random.randint(100, 999)}",
            "time": time.strftime("%H:%M:%S"),
            "symbol": pos["symbol"],
            "strategy": "Cross Exchange Arbitrage",
            "buyExchange": pos["buyExchange"],
            "sellExchange": pos["sellExchange"],
            "entryPrice": pos["entryBuyPrice"],
            "exitPrice": pos["currentSellPrice"],
            "amount": pos["amount"],
            "fees": round(invested * 0.0004, 2),
            "netProfit": pnl,
            "result": "PROFIT" if pnl >= 0 else "LOSS"
        }

        user_data["tradeHistory"].insert(0, history_item)
        user_data["openPositions"] = [p for p in positions if p["id"] != position_id]

        return {
            "success": True,
            "message": f"Closed {pos['symbol']} Position: Net PnL ${pnl:,.2f}",
            "historyItem": history_item,
            "wallet": wallet
        }

    def execute_auto_arbitrage(self, email: str, opp: Dict) -> Dict:
        user_data = self.get_or_create_user(email)
        wallet = user_data["wallet"]
        balance = wallet["virtualBalance"]

        # Minimum required balance threshold
        if balance < 10.00:
            return {
                "success": False,
                "message": f"Bot Halted: Insufficient wallet balance (${balance:,.2f}). Minimum $10.00 USDT required."
            }

        # Dynamic trade sizing: 25% of wallet balance (min $20, max $500)
        trade_usd = min(max(balance * 0.25, 20.0), 500.0)
        unit_size = round(trade_usd / opp["ex1Price"], 4 if "BTC" in opp["symbol"] else 2)
        trade_cost = round(opp["ex1Price"] * unit_size, 2)

        if balance < trade_cost:
            return {
                "success": False,
                "message": f"Bot Halted: Need ${trade_cost:,.2f} for trade but wallet has ${balance:,.2f} USDT."
            }

        # Deduct trade cost on entry
        wallet["virtualBalance"] = round(wallet["virtualBalance"] - trade_cost, 2)

        net_pnl = opp.get("netProfit", 5.0)
        # Credit cost + net profit back on settlement
        wallet["virtualBalance"] = round(wallet["virtualBalance"] + trade_cost + net_pnl, 2)
        wallet["totalEquity"] = round(wallet["totalEquity"] + net_pnl, 2)
        wallet["todayProfit"] = round(wallet["todayProfit"] + net_pnl, 2)

        user_data["totalBotProfit"] = round(user_data["totalBotProfit"] + net_pnl, 2)
        user_data["autoTradeCount"] += 1

        bot_record = {
            "id": f"TRD-BOT-{random.randint(1000, 9999)}",
            "time": time.strftime("%H:%M:%S"),
            "symbol": opp["symbol"],
            "strategy": "Python Autopilot Bot Alpha",
            "isBot": True,
            "buyExchange": opp["buyExchange"],
            "sellExchange": opp["sellExchange"],
            "buyPrice": opp["ex1Price"],
            "sellPrice": opp["ex2Price"],
            "amount": unit_size,
            "buyTotal": trade_cost,
            "sellTotal": round(opp["ex2Price"] * unit_size, 2),
            "netProfit": net_pnl,
            "totalBotProfit": user_data["totalBotProfit"],
            "status": "COMPLETED"
        }

        user_data["tradeHistory"].insert(0, bot_record)

        return {
            "success": True,
            "message": f"Python Bot Executed: {opp['symbol']} +${net_pnl:,.2f}",
            "botRecord": bot_record,
            "wallet": wallet
        }

# Global Instance
python_trading_engine = PythonTradingEngine()
