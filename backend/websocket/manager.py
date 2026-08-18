"""
WebSocket Manager — Broadcasts live updates to all connected dashboard clients
"""
import asyncio
import json
import logging
import time
from typing import Set
from fastapi import WebSocket

logger = logging.getLogger("ARB.WS")

class ConnectionManager:
    def __init__(self):
        self.active: Set[WebSocket] = set()
        self._log_buffer = []
        self._max_buffer = 500

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)
        logger.info(f"WS client connected. Total: {len(self.active)}")

        # Send buffered logs to new client
        if self._log_buffer:
            await self._send_one(ws, {"type": "log_history", "logs": self._log_buffer[-100:]})

    def disconnect(self, ws: WebSocket):
        self.active.discard(ws)
        logger.info(f"WS client disconnected. Total: {len(self.active)}")

    async def broadcast(self, message: dict):
        if not self.active:
            return
        data = json.dumps(message)
        dead = set()
        for ws in self.active:
            try:
                await ws.send_text(data)
            except Exception:
                dead.add(ws)
        self.active -= dead

    async def broadcast_log(self, entry: dict):
        entry["type"] = "log"
        self._log_buffer.append(entry)
        if len(self._log_buffer) > self._max_buffer:
            self._log_buffer = self._log_buffer[-self._max_buffer:]
        await self.broadcast(entry)

    async def broadcast_opportunities(self, opportunities: list):
        await self.broadcast({"type": "opportunities", "data": opportunities, "ts": time.time()})

    async def broadcast_trade(self, trade: dict):
        await self.broadcast({"type": "trade", "data": trade, "ts": time.time()})

    async def broadcast_stats(self, stats: dict):
        await self.broadcast({"type": "stats", "data": stats, "ts": time.time()})

    async def broadcast_market(self, prices: dict):
        await self.broadcast({"type": "market", "data": prices, "ts": time.time()})

    async def broadcast_gas(self, gas: dict):
        await self.broadcast({"type": "gas", "data": gas, "ts": time.time()})

    async def _send_one(self, ws: WebSocket, message: dict):
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            pass

ws_manager = ConnectionManager()
