"""
Gas Engine — Real-time gas price tracking and cost estimation
"""
import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Optional
from backend.config import settings

logger = logging.getLogger("ARB.GAS")

@dataclass
class GasData:
    base_fee_gwei: float = 0.01          # Arbitrum L2 base fee
    priority_fee_gwei: float = 0.001
    gas_price_gwei: float = 0.011
    estimated_gas_units: int = 350_000   # Flash loan arb tx gas
    eth_price_usd: float = 3520.0
    last_updated: float = field(default_factory=time.time)

    @property
    def gas_cost_eth(self) -> float:
        return (self.gas_price_gwei * 1e-9) * self.estimated_gas_units

    @property
    def gas_cost_usd(self) -> float:
        return self.gas_cost_eth * self.eth_price_usd

    @property
    def is_stale(self) -> bool:
        return (time.time() - self.last_updated) > 30

class GasEngine:
    def __init__(self):
        self.data = GasData()
        self.running = False
        self._w3 = None

    def update_eth_price(self, price_usd: float):
        self.data.eth_price_usd = price_usd

    async def start(self):
        self.running = True
        asyncio.create_task(self._poll_gas())
        logger.info("Gas engine started — polling every 10s")

    async def stop(self):
        self.running = False

    async def _poll_gas(self):
        """Poll gas data — uses Web3 if RPC configured, else uses L2 defaults."""
        while self.running:
            try:
                if settings.rpc_url:
                    from web3 import AsyncWeb3
                    if not self._w3:
                        self._w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(settings.rpc_url))

                    fee_history = await self._w3.eth.fee_history(5, "latest", [50])
                    base_fees = [b / 1e9 for b in fee_history.get("baseFeePerGas", [0.01e9])]
                    self.data.base_fee_gwei = sum(base_fees) / len(base_fees)
                    rewards = fee_history.get("reward", [[1_000_000]])
                    self.data.priority_fee_gwei = sum(r[0] for r in rewards if r) / len(rewards) / 1e9
                    self.data.gas_price_gwei = self.data.base_fee_gwei + self.data.priority_fee_gwei
                else:
                    # Arbitrum Sepolia L2 defaults
                    self.data.base_fee_gwei = 0.01
                    self.data.priority_fee_gwei = 0.001
                    self.data.gas_price_gwei = 0.011

                self.data.last_updated = time.time()
                logger.debug(f"Gas: {self.data.gas_price_gwei:.4f} gwei | Est cost: ${self.data.gas_cost_usd:.4f}")

            except Exception as e:
                logger.warning(f"Gas poll failed: {e}")

            await asyncio.sleep(10)

    def get_gas_cost_usd(self, gas_units: int = 350_000) -> float:
        """Estimate gas cost in USD for a given number of gas units."""
        cost_eth = (self.data.gas_price_gwei * 1e-9) * gas_units
        return cost_eth * self.data.eth_price_usd

    def exceeds_limit(self, expected_profit_usd: float) -> bool:
        return self.data.gas_cost_usd >= expected_profit_usd

    def to_dict(self) -> dict:
        return {
            "base_fee_gwei": round(self.data.base_fee_gwei, 6),
            "priority_fee_gwei": round(self.data.priority_fee_gwei, 6),
            "gas_price_gwei": round(self.data.gas_price_gwei, 6),
            "estimated_gas_units": self.data.estimated_gas_units,
            "gas_cost_usd": round(self.data.gas_cost_usd, 4),
            "eth_price_usd": self.data.eth_price_usd,
            "is_stale": self.data.is_stale,
        }

gas_engine = GasEngine()
