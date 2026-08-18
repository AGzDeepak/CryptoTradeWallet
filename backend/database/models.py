"""
SQLAlchemy Models — Flash Arbitrage Engine
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from backend.config import settings

class Base(DeclarativeBase):
    pass

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pair = Column(String, nullable=False)
    buy_dex = Column(String, nullable=False)
    sell_dex = Column(String, nullable=False)
    input_amount = Column(Float, nullable=False)
    spread_pct = Column(Float, nullable=False)
    gross_profit = Column(Float, nullable=False)
    flash_loan_fee = Column(Float, nullable=False)
    swap_fees = Column(Float, nullable=False)
    gas_cost = Column(Float, nullable=False)
    mev_cost = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    profit_bps = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    status = Column(String, default="DETECTED")   # DETECTED | SIMULATING | REJECTED | EXECUTABLE | EXECUTED
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    block_number = Column(Integer, nullable=True)

class Trade(Base):
    __tablename__ = "trades"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    opportunity_id = Column(String, nullable=True)
    mode = Column(String, nullable=False)          # paper | testnet | mainnet
    pair = Column(String, nullable=False)
    buy_dex = Column(String, nullable=False)
    sell_dex = Column(String, nullable=False)
    input_amount = Column(Float, nullable=False)
    expected_profit = Column(Float, nullable=False)
    actual_profit = Column(Float, nullable=True)
    gas_used = Column(Float, nullable=True)
    gas_cost_usd = Column(Float, nullable=True)
    tx_hash = Column(String, nullable=True)
    block_number = Column(Integer, nullable=True)
    status = Column(String, default="QUEUED")      # QUEUED | SIGNING | BROADCASTED | CONFIRMED | FAILED | REVERTED
    error_message = Column(String, nullable=True)
    simulation_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)

class GasHistory(Base):
    __tablename__ = "gas_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    base_fee_gwei = Column(Float)
    priority_fee_gwei = Column(Float)
    gas_price_gwei = Column(Float)
    eth_price_usd = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SystemEvent(Base):
    __tablename__ = "system_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String)
    message = Column(Text)
    data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# ─── ENGINE SETUP ─────────────────────────────────────────────────────────────

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
