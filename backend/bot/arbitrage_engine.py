"""
Main Arbitrage Engine — Async event-driven main loop
Coordinates market data, opportunity detection, risk checks, and execution.
"""
import asyncio
import logging
import time
from backend.config import settings
from backend.bot.market_data import market_data
from backend.bot.gas_engine import gas_engine
from backend.bot.opportunity_detector import opportunity_detector
from backend.bot.execution_engine import execution_engine, TradeRecord
from backend.bot.risk_engine import risk_engine

logger = logging.getLogger("ARB.ENGINE")

class ArbitrageEngine:
    def __init__(self):
        self.running = False
        self.auto_execute = False
        self.scan_count = 0
        self.start_time = None
        self._execution_lock = asyncio.Lock()

    async def start(self):
        """Start all engine components."""
        if self.running:
            return

        self.running = True
        self.start_time = time.time()

        logger.info("=" * 60)
        logger.info("  FLASH ARBITRAGE ENGINE STARTING")
        logger.info("=" * 60)
        logger.info(f"  Mode:    {settings.execution_mode.upper()}")
        logger.info(f"  Chain:   {settings.chain_name} ({settings.chain_id})")
        logger.info(f"  Execute: {'ENABLED' if settings.can_execute else 'DISABLED'}")
        logger.info(f"  MinProf: ${settings.min_profit_usd:.2f} ({settings.min_profit_bps} bps)")
        logger.info("=" * 60)

        await market_data.start()
        await gas_engine.start()
        await opportunity_detector.start()

        asyncio.create_task(self._main_loop())
        logger.info("Engine fully started")

    async def stop(self):
        """Stop all engine components."""
        self.running = False
        await market_data.stop()
        await gas_engine.stop()
        await opportunity_detector.stop()
        logger.info("Engine stopped")

    async def _main_loop(self):
        """
        Main execution loop:
        1. Check for executable opportunities
        2. Run risk checks
        3. Execute if auto_execute is ON and all checks pass
        """
        await asyncio.sleep(3)  # Wait for initial market data

        while self.running:
            try:
                if risk_engine.emergency_stop:
                    await asyncio.sleep(1)
                    continue

                if self.auto_execute and settings.can_execute:
                    executables = opportunity_detector.get_executable()
                    if executables:
                        best = executables[0]
                        if best.net_profit >= settings.min_profit_usd:
                            async with self._execution_lock:
                                logger.info(f"Auto-executing: {best.pair} | Net: ${best.net_profit:.2f}")
                                await execution_engine.execute(best)

            except Exception as e:
                logger.error(f"Main loop error: {e}")

            await asyncio.sleep(1)

    def set_auto_execute(self, enabled: bool):
        self.auto_execute = enabled
        logger.info(f"Auto-execute: {'ON' if enabled else 'OFF'}")

    async def manual_execute(self, opportunity_id: str) -> dict:
        """Manually trigger execution of a specific opportunity by ID."""
        opp = next((o for o in opportunity_detector.opportunities if o.id == opportunity_id), None)
        if not opp:
            return {"success": False, "error": "Opportunity not found or expired"}

        if opp.is_stale:
            return {"success": False, "error": "Opportunity is stale — quote expired"}

        async with self._execution_lock:
            trade = await execution_engine.execute(opp)

        return {
            "success": trade.status == "CONFIRMED",
            "trade": trade.to_dict(),
            "error": trade.error_message if trade.status != "CONFIRMED" else None,
        }

    def get_status(self) -> dict:
        uptime = int(time.time() - self.start_time) if self.start_time else 0
        return {
            "running": self.running,
            "auto_execute": self.auto_execute,
            "mode": settings.execution_mode,
            "chain": settings.chain_name,
            "chain_id": settings.chain_id,
            "can_execute": settings.can_execute,
            "emergency_stop": risk_engine.emergency_stop,
            "scan_count": opportunity_detector.scan_count,
            "uptime_seconds": uptime,
            "min_profit_usd": settings.min_profit_usd,
            "min_profit_bps": settings.min_profit_bps,
            "max_trade_size": settings.max_trade_size,
            "max_gas_usd": settings.max_gas_usd,
            "max_slippage_bps": settings.max_slippage_bps,
            "daily_loss_usd": risk_engine.daily_loss_usd,
            "max_daily_loss_usd": settings.max_daily_loss_usd,
        }

arbitrage_engine = ArbitrageEngine()
