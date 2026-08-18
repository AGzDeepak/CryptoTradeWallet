"""
Flash Arbitrage Engine — FastAPI Backend
Production-grade REST + WebSocket server
"""
import asyncio
import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.config import settings
from backend.database.models import init_db
from backend.bot.arbitrage_engine import arbitrage_engine
from backend.bot.opportunity_detector import opportunity_detector
from backend.bot.execution_engine import execution_engine
from backend.bot.risk_engine import risk_engine
from backend.bot.gas_engine import gas_engine
from backend.bot.market_data import market_data
from backend.websocket.manager import ws_manager

logging.basicConfig(level=settings.log_level, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("ARB.APP")

# ─── STARTUP / SHUTDOWN ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Flash Arbitrage Engine...")
    await init_db()

    # Wire execution engine logs to WebSocket broadcast
    execution_engine.add_log_callback(ws_manager.broadcast_log)

    await arbitrage_engine.start()

    # Background periodic broadcaster
    asyncio.create_task(_broadcast_loop())

    yield

    logger.info("Shutting down...")
    await arbitrage_engine.stop()

app = FastAPI(title="Flash Arbitrage Engine", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── PERIODIC BROADCAST ───────────────────────────────────────────────────────

async def _broadcast_loop():
    """Broadcast live data to all WebSocket clients every second."""
    while True:
        try:
            await ws_manager.broadcast_opportunities(opportunity_detector.get_top_opportunities(15))
            await ws_manager.broadcast_stats({
                **execution_engine.get_stats(),
                **arbitrage_engine.get_status(),
            })
            await ws_manager.broadcast_market(market_data.get_all_prices())
            await ws_manager.broadcast_gas(gas_engine.to_dict())
        except Exception as e:
            logger.debug(f"Broadcast error: {e}")
        await asyncio.sleep(1)

# ─── WEBSOCKET ENDPOINT ───────────────────────────────────────────────────────

@app.websocket("/ws/arbitrage")
async def websocket_endpoint(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # Keep alive (handle ping/pong)
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)

# ─── REST ENDPOINTS ───────────────────────────────────────────────────────────

@app.get("/api/arbitrage/status")
async def get_status():
    return arbitrage_engine.get_status()

@app.get("/api/arbitrage/opportunities")
async def get_opportunities():
    return {
        "opportunities": opportunity_detector.get_top_opportunities(20),
        "scan_count": opportunity_detector.scan_count,
        "timestamp": time.time(),
    }

@app.get("/api/arbitrage/stats")
async def get_stats():
    return {
        **execution_engine.get_stats(),
        "gas": gas_engine.to_dict(),
        "prices": market_data.get_all_prices(),
    }

@app.get("/api/arbitrage/config")
async def get_config():
    return {
        "mode": settings.execution_mode,
        "chain_id": settings.chain_id,
        "chain_name": settings.chain_name,
        "min_profit_usd": settings.min_profit_usd,
        "min_profit_bps": settings.min_profit_bps,
        "max_trade_size": settings.max_trade_size,
        "max_slippage_bps": settings.max_slippage_bps,
        "max_gas_usd": settings.max_gas_usd,
        "max_daily_loss_usd": settings.max_daily_loss_usd,
        "execution_enabled": settings.execution_enabled,
        "mainnet_enabled": settings.mainnet_enabled,
        "flash_loan_asset": settings.flash_loan_asset_symbol,
        "aave_pool": settings.aave_pool,
        "explorer": settings.explorer_url,
    }

@app.get("/api/transactions")
async def get_transactions():
    return {"trades": execution_engine.get_recent_trades(50)}

# ─── EXECUTION CONTROLS ───────────────────────────────────────────────────────

class ExecuteRequest(BaseModel):
    opportunity_id: str

class AutoExecuteRequest(BaseModel):
    enabled: bool

class ModeRequest(BaseModel):
    mode: str
    mainnet_confirmed: Optional[bool] = False

@app.post("/api/arbitrage/start")
async def start_engine():
    arbitrage_engine.running = True
    await arbitrage_engine.start()
    return {"status": "started"}

@app.post("/api/arbitrage/stop")
async def stop_engine():
    arbitrage_engine.auto_execute = False
    arbitrage_engine.running = False
    return {"status": "stopped"}

@app.post("/api/arbitrage/auto-execute")
async def set_auto_execute(req: AutoExecuteRequest):
    arbitrage_engine.set_auto_execute(req.enabled)
    return {"auto_execute": req.enabled}

@app.post("/api/arbitrage/execute")
async def manual_execute(req: ExecuteRequest):
    result = await arbitrage_engine.manual_execute(req.opportunity_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Execution failed"))
    return result

@app.post("/api/arbitrage/simulate")
async def simulate(req: ExecuteRequest):
    opp = next((o for o in opportunity_detector.opportunities if o.id == req.opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {
        "pair": opp.pair,
        "buy_dex": opp.buy_dex,
        "sell_dex": opp.sell_dex,
        "input_amount": opp.input_amount_usd,
        "expected_output": opp.expected_output_usd,
        "gross_profit": opp.gross_profit,
        "flash_loan_fee": opp.flash_loan_fee,
        "swap_fees": opp.swap_fees,
        "gas_cost": opp.gas_cost,
        "net_profit": opp.net_profit,
        "profit_bps": opp.profit_bps,
        "simulation": "PASSED" if opp.is_profitable else "REJECTED",
        "reason": opp.rejection_reason or "All checks passed",
    }

@app.post("/api/emergency-stop")
async def emergency_stop():
    risk_engine.activate_emergency_stop()
    arbitrage_engine.auto_execute = False
    await ws_manager.broadcast({"type": "emergency_stop", "ts": time.time()})
    return {"status": "EMERGENCY_STOP_ACTIVATED"}

@app.post("/api/emergency-resume")
async def emergency_resume():
    risk_engine.deactivate_emergency_stop()
    return {"status": "RESUMED"}

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": arbitrage_engine.running,
        "mode": settings.execution_mode,
        "uptime": int(time.time() - arbitrage_engine.start_time) if arbitrage_engine.start_time else 0,
    }
