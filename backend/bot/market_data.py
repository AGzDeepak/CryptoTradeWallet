"""
Real-Time Market Data Engine
Fetches live prices from Binance WebSocket + on-chain DEX quotes
"""
import asyncio
import json
import time
import logging
from typing import Dict, Optional
import aiohttp

logger = logging.getLogger("ARB.MARKET")

BINANCE_WS = "wss://stream.binance.com:9443/stream?streams="
TOKENS = ["ethusdt", "wbtcusdt", "uniusdt", "linkusdt", "arbusdt"]

class MarketDataEngine:
    def __init__(self):
        self.prices: Dict[str, float] = {}
        self.last_update: Dict[str, float] = {}
        self.running = False
        self._ws = None
        self._session: Optional[aiohttp.ClientSession] = None

        # Seed with reasonable defaults (will be overwritten by live data)
        self.prices = {
            "ETH": 3520.0,
            "WETH": 3520.0,
            "WBTC": 61200.0,
            "USDC": 1.0,
            "USDT": 1.0,
            "DAI": 1.0,
            "UNI": 8.45,
            "LINK": 13.72,
            "ARB": 0.75,
        }

    async def start(self):
        self.running = True
        self._session = aiohttp.ClientSession()
        asyncio.create_task(self._stream_binance())
        logger.info("Market data engine started — Binance WebSocket stream active")

    async def stop(self):
        self.running = False
        if self._ws:
            await self._ws.close()
        if self._session:
            await self._session.close()

    async def _stream_binance(self):
        """Stream real-time prices from Binance WebSocket."""
        stream_names = "/".join([f"{t}@ticker" for t in TOKENS])
        url = f"{BINANCE_WS}{stream_names}"

        while self.running:
            try:
                async with self._session.ws_connect(url, heartbeat=30) as ws:
                    self._ws = ws
                    logger.info(f"Binance WebSocket connected: {len(TOKENS)} streams")
                    async for msg in ws:
                        if not self.running:
                            break
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            if "data" in data:
                                self._process_ticker(data["data"])
            except Exception as e:
                logger.warning(f"Binance WS disconnected: {e} — reconnecting in 3s")
                await asyncio.sleep(3)

    def _process_ticker(self, ticker: dict):
        symbol = ticker.get("s", "").upper()
        price = float(ticker.get("c", 0))
        if price <= 0:
            return

        mapping = {
            "ETHUSDT": "ETH",
            "WBTCUSDT": "WBTC",
            "UNIUSDT": "UNI",
            "LINKUSDT": "LINK",
            "ARBUSDT": "ARB",
        }
        token = mapping.get(symbol)
        if token:
            self.prices[token] = price
            if token == "ETH":
                self.prices["WETH"] = price
            self.last_update[token] = time.time()

    def get_price(self, token: str) -> float:
        return self.prices.get(token.upper(), 0.0)

    def get_all_prices(self) -> Dict[str, float]:
        return dict(self.prices)

    def is_stale(self, token: str, max_age_seconds: float = 30.0) -> bool:
        last = self.last_update.get(token.upper(), 0)
        return (time.time() - last) > max_age_seconds

    def get_eth_price(self) -> float:
        return self.prices.get("ETH", 3520.0)

market_data = MarketDataEngine()
