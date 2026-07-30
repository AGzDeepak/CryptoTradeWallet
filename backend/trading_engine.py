"""
CryptoBot AI — Python Quantitative Trading & Wallet Engine
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, FastAPI, Pydantic, NumPy, Datastore Engine
"""

import time
import random
import uuid
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

    def execute_order(
        self,
        email: str,
        side: str,
        symbol: str,
        exchange: str,
        amount: float,
        current_price: float,
    ) -> Dict:
        user = self.get_or_create_user(email)
        wallet = user["wallet"]
        positions = user["openPositions"]
        history = user.setdefault("tradeHistory", [])

        side = side.upper()

        # ============================================================
        # BUY ORDER
        # ============================================================
        if side == "BUY":
            total_cost = round(amount * current_price, 2)

            if wallet["virtualBalance"] < total_cost:
                return {
                    "success": False,
                    "message": "Insufficient USDT balance."
                }

            wallet["virtualBalance"] = round(
                wallet["virtualBalance"] - total_cost,
                2
            )

            position = {
                "id": str(uuid.uuid4()),
                "symbol": symbol,
                "exchange": exchange,
                "buyExchange": exchange,
                "sellExchange": "Bybit" if exchange == "Binance" else "Binance",
                "type": "BUY",
                "amount": amount,
                "entryPrice": current_price,
                "entryBuyPrice": current_price,
                "entrySellPrice": round(current_price * 1.004, 2),
                "currentPrice": current_price,
                "currentBuyPrice": current_price,
                "currentSellPrice": round(current_price * 1.004, 2),
                "invested": total_cost,
                "status": "OPEN",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "unrealizedPnL": 0.0
            }

            positions.append(position)

            history.append({
                "type": "BUY",
                "symbol": symbol,
                "exchange": exchange,
                "amount": amount,
                "price": current_price,
                "total": total_cost,
                "time": position["timestamp"]
            })

            return {
                "success": True,
                "message": f"Bought {amount} {symbol}",
                "wallet": wallet,
                "position": position
            }

        # ============================================================
        # SELL ORDER
        # ============================================================
        elif side == "SELL":
            remaining = amount
            total_sell_value = 0.0
            total_profit = 0.0
            closed_positions = []

            for position in positions[:]:
                if position["symbol"] != symbol:
                    continue

                if position["status"] not in ("OPEN", "ACTIVE"):
                    continue

                available = position["amount"]
                sell_qty = min(available, remaining)
                entry_p = position.get("entryPrice", position.get("entryBuyPrice", current_price))
                buy_value = sell_qty * entry_p
                sell_value = sell_qty * current_price
                profit = sell_value - buy_value

                total_sell_value += sell_value
                total_profit += profit

                position["amount"] -= sell_qty
                remaining -= sell_qty

                if position["amount"] <= 0:
                    position["status"] = "CLOSED"
                    positions.remove(position)
                    closed_positions.append(position["id"])

                if remaining <= 0:
                    break

            if remaining > 0:
                return {
                    "success": False,
                    "message": "Not enough crypto to sell."
                }

            wallet["virtualBalance"] = round(
                wallet["virtualBalance"] + total_sell_value,
                2
            )
            wallet["todayProfit"] = round(wallet.get("todayProfit", 0.0) + total_profit, 2)
            wallet["totalEquity"] = round(wallet.get("totalEquity", wallet["virtualBalance"]) + total_profit, 2)

            history.append({
                "type": "SELL",
                "symbol": symbol,
                "exchange": exchange,
                "amount": amount,
                "price": current_price,
                "total": round(total_sell_value, 2),
                "profit": round(total_profit, 2),
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            })

            return {
                "success": True,
                "message": f"Sold {amount} {symbol}",
                "wallet": wallet,
                "profit": round(total_profit, 2),
                "closedPositions": closed_positions
            }

        # ============================================================
        # INVALID ORDER
        # ============================================================
        return {
            "success": False,
            "message": "Invalid order type."
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
