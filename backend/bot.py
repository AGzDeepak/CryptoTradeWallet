"""
CryptoBot AI — High-Performance Python Quant Arbitrage Engine
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, Spatial Arbitrage Engine, Real-Time Market Evaluation & Money Control Limits
"""

import time
import math
import random
from typing import List, Dict, Optional

class PythonQuantArbitrageBot:
    def __init__(
        self, 
        min_profit_threshold: float = 0.25,
        take_profit_target: float = 500.00,
        stop_loss_limit: float = 150.00,
        max_trade_size: float = 250.00
    ):
        self.min_profit_threshold = min_profit_threshold
        self.take_profit_target = take_profit_target
        self.stop_loss_limit = stop_loss_limit
        self.max_trade_size = max_trade_size
        self.is_running = True
        self.total_bot_profit = 0.0
        self.trade_count = 0
        self.auto_stop_reason: Optional[str] = None
        self.logs = []

    def set_risk_limits(self, take_profit: float, stop_loss: float, max_allocation: float):
        self.take_profit_target = take_profit
        self.stop_loss_limit = stop_loss
        self.max_trade_size = max_allocation

    def reset_limits_and_resume(self):
        if self.auto_stop_reason == "TAKE_PROFIT_TARGET_HIT" or (self.take_profit_target > 0 and self.total_bot_profit >= self.take_profit_target):
            self.take_profit_target = max(self.take_profit_target + 500.0, self.total_bot_profit + 500.0)
        
        if self.auto_stop_reason == "STOP_LOSS_LIMIT_HIT":
            self.stop_loss_limit += 150.0

        self.auto_stop_reason = None
        self.is_running = True

    def evaluate_and_execute(self, arbitrage_opps: List[Dict]) -> List[Dict]:
        """
        Evaluates spatial arbitrage opportunities while enforcing Take-Profit and Stop-Loss Money Controls
        """
        if not self.is_running:
            return []

        # Money Control Check 1: Take Profit Target Hit
        if self.take_profit_target > 0 and self.total_bot_profit >= self.take_profit_target:
            self.is_running = False
            self.auto_stop_reason = "TAKE_PROFIT_TARGET_HIT"
            return []

        # Money Control Check 2: Stop Loss Limit Hit
        if self.stop_loss_limit > 0 and self.total_bot_profit < 0 and abs(self.total_bot_profit) >= self.stop_loss_limit:
            self.is_running = False
            self.auto_stop_reason = "STOP_LOSS_LIMIT_HIT"
            return []

        profitable_opps = [
            o for o in arbitrage_opps 
            if o.get("isProfitable") and o.get("diffPct", 0) >= self.min_profit_threshold
        ]

        # Sort by highest net profit yield
        profitable_opps.sort(key=lambda x: x.get("netProfit", 0), reverse=True)

        executed_trades = []
        for opp in profitable_opps[:3]:
            net_pnl = opp["netProfit"]
            self.total_bot_profit = round(self.total_bot_profit + net_pnl, 2)
            self.trade_count += 1

            log_entry = {
                "id": f"PY_BOT_{int(time.time() * 1000)}",
                "symbol": opp["symbol"],
                "buyExchange": opp["buyExchange"],
                "sellExchange": opp["sellExchange"],
                "buyPrice": opp["ex1Price"],
                "sellPrice": opp["ex2Price"],
                "spreadPct": opp["diffPct"],
                "netProfit": net_pnl,
                "timestamp": time.strftime("%H:%M:%S"),
                "status": "BUY_SELL_EXECUTED"
            }

            self.logs.insert(0, log_entry)
            if len(self.logs) > 100:
                self.logs.pop()

            executed_trades.append(log_entry)

        return executed_trades

# Global Python Quant Bot Instance
python_quant_bot = PythonQuantArbitrageBot(min_profit_threshold=0.25)
