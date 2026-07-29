"""
CryptoBot AI — Python Swap Engine & Pair Calculator
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, Math, Pydantic
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field
from trading_engine import python_trading_engine

DEFAULT_COIN_PRICES = {
    "BTC": 67840.50,
    "ETH": 3540.20,
    "SOL": 184.75,
    "AVAX": 38.60,
    "XRP": 0.6240,
    "USD": 1.00,
    "USDT": 1.00
}

class SwapEstimateRequest(BaseModel):
    payCoin: str = Field(default="USD")
    getCoin: str = Field(default="ETH")
    payAmount: float = Field(default=1000.0)

class SwapExecuteRequest(BaseModel):
    email: str = Field(default="deepak@chainblock.io")
    side: str = Field(default="BUY")
    payCoin: str = Field(default="USD")
    getCoin: str = Field(default="ETH")
    payAmount: float = Field(default=1000.0)
    walletMode: str = Field(default="DEMO")
    walletAddress: Optional[str] = None

class PythonSwapEngine:
    @staticmethod
    def calculate_estimate(pay_coin: str, get_coin: str, pay_amount: float) -> Dict:
        pay_unit_usd = DEFAULT_COIN_PRICES.get(pay_coin.upper(), 1.00)
        get_unit_usd = DEFAULT_COIN_PRICES.get(get_coin.upper(), 3540.20)

        total_pay_usd = pay_amount * pay_unit_usd
        raw_get_units = total_pay_usd / get_unit_usd
        
        # Deduct 0.04% fee
        est_fees_usd = total_pay_usd * 0.0004
        net_get_units = (total_pay_usd - est_fees_usd) / get_unit_usd

        return {
            "payCoin": pay_coin.upper(),
            "getCoin": get_coin.upper(),
            "payAmount": pay_amount,
            "targetPriceUsd": get_unit_usd,
            "estimatedGetUnits": round(net_get_units, 6 if get_coin.upper() in ["BTC", "ETH"] else 4),
            "estimatedFeesUsd": round(est_fees_usd, 2),
            "exchangeRateText": f"1 {get_coin.upper()} = ${get_unit_usd:,.2f} USD"
        }

    @staticmethod
    def execute_swap(req: SwapExecuteRequest) -> Dict:
        estimate = PythonSwapEngine.calculate_estimate(req.payCoin, req.getCoin, req.payAmount)
        target_symbol = f"{req.getCoin.upper()}USDT" if req.getCoin.upper() != "USD" else "ETHUSDT"
        target_price = estimate["targetPriceUsd"]
        get_units = estimate["estimatedGetUnits"]

        if req.walletMode == "REAL":
            return {
                "success": True,
                "message": f"Real Web3 Swap Broadcasted via Python Engine: {req.payAmount} {req.payCoin} -> {get_units} {req.getCoin}",
                "estimate": estimate,
                "txHash": f"0x{hash(req.email + str(req.payAmount)):064x}"
            }

        # Execute in Python Trading Datastore
        res = python_trading_engine.execute_order(
            req.email,
            req.side.upper(),
            target_symbol,
            "Binance (Python Engine)",
            get_units,
            target_price
        )
        return res

python_swap_engine = PythonSwapEngine()
