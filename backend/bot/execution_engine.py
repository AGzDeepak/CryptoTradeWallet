"""
Execution Engine — Production-grade flash loan arbitrage executor
Handles PAPER / TESTNET / MAINNET execution with full lifecycle tracking.
"""
import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import List, Optional, Callable
from backend.config import settings
from backend.bot.opportunity_detector import ArbitrageOpportunity
from backend.bot.risk_engine import risk_engine, RiskCheckResult
from backend.bot.gas_engine import gas_engine

logger = logging.getLogger("ARB.EXECUTION")

@dataclass
class TradeRecord:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    opportunity_id: str = ""
    mode: str = "paper"
    pair: str = ""
    buy_dex: str = ""
    sell_dex: str = ""
    input_amount: float = 0.0
    expected_profit: float = 0.0
    actual_profit: Optional[float] = None
    gas_used: Optional[int] = None
    gas_cost_usd: Optional[float] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    status: str = "QUEUED"
    error_message: str = ""
    risk_checks: list = field(default_factory=list)
    simulation_result: Optional[dict] = None
    created_at: float = field(default_factory=time.time)
    confirmed_at: Optional[float] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "mode": self.mode,
            "pair": self.pair,
            "buy_dex": self.buy_dex,
            "sell_dex": self.sell_dex,
            "input_amount": round(self.input_amount, 2),
            "expected_profit": round(self.expected_profit, 4),
            "actual_profit": round(self.actual_profit, 4) if self.actual_profit is not None else None,
            "gas_cost_usd": round(self.gas_cost_usd, 4) if self.gas_cost_usd else None,
            "tx_hash": self.tx_hash,
            "block_number": self.block_number,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at,
            "confirmed_at": self.confirmed_at,
        }


class ExecutionEngine:
    def __init__(self):
        self.trades: List[TradeRecord] = []
        self.running = False
        self._log_callbacks: List[Callable] = []
        self.paper_balance_usdc = settings.paper_balance_usdc
        self.total_profit = 0.0
        self.total_gas_spent = 0.0
        self.win_count = 0
        self.loss_count = 0
        self.nonce = 0

    def add_log_callback(self, cb: Callable):
        self._log_callbacks.append(cb)

    def _emit(self, level: str, tag: str, msg: str, data: dict = None):
        """Broadcast log entry to all registered callbacks."""
        entry = {
            "ts": time.strftime("%H:%M:%S.") + f"{int((time.time() % 1) * 1000):03d}",
            "level": level,
            "tag": tag,
            "msg": msg,
            "data": data or {}
        }
        for cb in self._log_callbacks:
            try:
                asyncio.create_task(cb(entry)) if asyncio.get_event_loop().is_running() else cb(entry)
            except Exception:
                pass
        logger.info(f"[{tag}] {msg}")

    async def execute(self, opp: ArbitrageOpportunity) -> TradeRecord:
        """Full production execution lifecycle for one opportunity."""
        trade = TradeRecord(
            opportunity_id=opp.id,
            mode=settings.execution_mode,
            pair=opp.pair,
            buy_dex=opp.buy_dex,
            sell_dex=opp.sell_dex,
            input_amount=opp.input_amount_usd,
            expected_profit=opp.net_profit,
        )
        self.trades.insert(0, trade)
        if len(self.trades) > 200:
            self.trades = self.trades[:200]

        self._emit("INFO", "ARB", f"=== OPPORTUNITY DETECTED: {opp.pair} ===")
        self._emit("INFO", "ARB", f"Spread: {opp.spread_pct:.4f}% | Size: ${opp.input_amount_usd:,.0f}")
        self._emit("INFO", "ARB", f"Gross: ${opp.gross_profit:.2f} | Flash fee: ${opp.flash_loan_fee:.2f} | Gas: ${opp.gas_cost:.4f}")
        self._emit("INFO", "ARB", f"Expected NET: ${opp.net_profit:.2f} ({opp.profit_bps:.1f} bps)")

        # ── STEP 1: RISK CHECKS ───────────────────────────────────────────────
        self._emit("INFO", "RISK", "Running 18-point risk validation...")
        trade.status = "SIMULATING"

        passed, checks = risk_engine.validate_opportunity(
            net_profit_usd=opp.net_profit,
            profit_bps=opp.profit_bps,
            gas_cost_usd=opp.gas_cost,
            slippage_bps=opp.slippage_cost / opp.input_amount_usd * 10_000 if opp.input_amount_usd > 0 else 0,
            price_impact_bps=(opp.input_amount_usd / 1_000_000) * 50,
            liquidity_ok=True,
            simulation_passed=True if settings.is_paper else None,
            quote_age_seconds=opp.age_seconds,
            trade_size_usd=opp.input_amount_usd,
            buy_dex=opp.buy_dex,
            sell_dex=opp.sell_dex,
            mode=settings.execution_mode,
        )

        trade.risk_checks = [{"name": c.check_name, "passed": c.passed, "reason": c.reason} for c in checks]

        for c in checks:
            status = "PASS ✓" if c.passed else "FAIL ✗"
            self._emit("INFO" if c.passed else "WARNING", "RISK", f"  {status} {c.check_name}: {c.reason}")

        if not passed:
            failed = [c for c in checks if not c.passed]
            reason = failed[0].reason if failed else "Risk check failed"
            trade.status = "FAILED"
            trade.error_message = f"REJECTED: {reason}"
            opp.status = "REJECTED"
            opp.rejection_reason = reason
            self._emit("WARNING", "RISK", f"REJECTED — {reason}")
            return trade

        self._emit("INFO", "RISK", "ALL RISK CHECKS PASSED ✓")

        # ── STEP 2: EXECUTE ───────────────────────────────────────────────────
        if settings.is_paper:
            return await self._execute_paper(trade, opp)
        elif settings.execution_mode == "testnet":
            return await self._execute_onchain(trade, opp)
        else:  # mainnet
            if not (settings.mainnet_enabled and settings.execution_enabled):
                trade.status = "FAILED"
                trade.error_message = "MAINNET execution requires explicit authorization"
                self._emit("ERROR", "EXEC", "MAINNET NOT AUTHORIZED — Set MAINNET_ENABLED=true and EXECUTION_ENABLED=true")
                return trade
            return await self._execute_onchain(trade, opp)

    async def _execute_paper(self, trade: TradeRecord, opp: ArbitrageOpportunity) -> TradeRecord:
        """Paper mode: simulate full execution with virtual balance, no blockchain calls."""
        self._emit("INFO", "EXEC", "MODE: PAPER — Virtual execution (no blockchain)")
        trade.status = "SIGNING"

        await asyncio.sleep(0.3)  # Simulate signing latency

        # Simulate atomic flash loan execution
        self._emit("INFO", "FLASHLOAN", f"1. BORROW +${opp.input_amount_usd:,.0f} USDC from Aave V3 (0.05% fee)")
        await asyncio.sleep(0.2)

        self._emit("INFO", "DEX", f"2. SWAP BUY on {opp.buy_dex}: ${opp.input_amount_usd:,.0f} → {opp.token_amount:.4f} tokens @ ${opp.buy_price:.2f}")
        await asyncio.sleep(0.2)

        self._emit("INFO", "DEX", f"3. SWAP SELL on {opp.sell_dex}: {opp.token_amount:.4f} tokens → ${opp.expected_output_usd:,.2f} @ ${opp.sell_price:.2f}")
        await asyncio.sleep(0.2)

        repayment = opp.input_amount_usd + opp.flash_loan_fee
        self._emit("INFO", "FLASHLOAN", f"4. REPAY Aave V3: ${repayment:,.2f} USDC (principal + ${opp.flash_loan_fee:.2f} fee)")
        await asyncio.sleep(0.2)

        # Add small realistic slippage variance
        import random
        actual_profit = opp.net_profit * random.uniform(0.92, 1.05)
        gas_cost = gas_engine.get_gas_cost_usd(350_000)

        trade.status = "CONFIRMED"
        trade.actual_profit = actual_profit
        trade.gas_cost_usd = gas_cost
        trade.tx_hash = f"PAPER-{trade.id[:12].upper()}"  # Virtual "hash"
        trade.confirmed_at = time.time()

        self.paper_balance_usdc += actual_profit
        self.total_profit += actual_profit
        self.total_gas_spent += gas_cost
        self.win_count += 1
        opp.status = "EXECUTED"

        self._emit("INFO", "EXEC", "=" * 50)
        self._emit("INFO", "EXEC", f"✅ PAPER TRADE CONFIRMED")
        self._emit("INFO", "EXEC", f"   Expected: +${opp.net_profit:.4f} USDC")
        self._emit("INFO", "EXEC", f"   Actual:   +${actual_profit:.4f} USDC")
        self._emit("INFO", "EXEC", f"   Diff:     {actual_profit - opp.net_profit:+.4f} USDC")
        self._emit("INFO", "EXEC", f"   Balance:  ${self.paper_balance_usdc:,.2f} USDC")
        self._emit("INFO", "EXEC", "=" * 50)

        return trade

    async def _execute_onchain(self, trade: TradeRecord, opp: ArbitrageOpportunity) -> TradeRecord:
        """
        Real on-chain execution via deployed FlashArbitrageExecutor contract.
        Full lifecycle: verify → simulate → build tx → sign → broadcast → receipt → parse events.
        """
        from backend.bot.contract_manager import contract_manager, ContractStatus

        # ── 1. Verify contract is deployed ────────────────────────────────────
        self._emit("INFO", "EXEC", "Verifying FlashArbitrageExecutor contract on-chain...")
        contract_info = await contract_manager.verify_onchain()

        if contract_info["status"] == ContractStatus.NOT_CONFIGURED:
            trade.status = "FAILED"
            trade.error_message = "DEPLOYED_CONTRACT not set — deploy FlashArbitrageExecutor.sol first"
            self._emit("ERROR", "EXEC", "❌ DEPLOYED_CONTRACT not configured in .env")
            self._emit("ERROR", "EXEC", "   Deploy via Remix IDE → set DEPLOYED_CONTRACT=0x... in .env")
            return trade

        if contract_info["status"] == ContractStatus.NOT_DEPLOYED:
            trade.status = "FAILED"
            trade.error_message = f"No contract code at {contract_info['address']}"
            self._emit("ERROR", "EXEC", f"❌ No contract at {contract_info['address']} on {settings.chain_name}")
            return trade

        if contract_info["status"] == ContractStatus.UNREACHABLE:
            trade.status = "FAILED"
            trade.error_message = f"RPC unreachable: {contract_info['message']}"
            self._emit("ERROR", "EXEC", f"❌ RPC error: {contract_info['message'][:100]}")
            return trade

        if contract_info.get("is_paused"):
            trade.status = "FAILED"
            trade.error_message = "Contract is paused (emergency stop active)"
            self._emit("ERROR", "EXEC", "❌ Contract is PAUSED — call resume() first")
            return trade

        self._emit("INFO", "EXEC", f"✓ Contract VERIFIED: {contract_info['address'][:12]}... | trades={contract_info.get('trade_count', 0)}")

        if not settings.rpc_url or not settings.private_key:
            trade.status = "FAILED"
            trade.error_message = "RPC_URL and PRIVATE_KEY required for on-chain execution"
            self._emit("ERROR", "EXEC", "❌ Missing RPC_URL or PRIVATE_KEY in .env")
            return trade

        try:
            from web3 import AsyncWeb3
            from eth_account import Account
            from backend.bot.contract_manager import FLASH_ARB_ABI

            w3  = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(settings.rpc_url))
            acct = Account.from_key(settings.private_key)

            self._emit("INFO", "EXEC", f"Wallet: {acct.address[:10]}...{acct.address[-6:]} | Chain: {settings.chain_name}")

            checksum_addr = AsyncWeb3.to_checksum_address(contract_info["address"])
            contract = w3.eth.contract(address=checksum_addr, abi=FLASH_ARB_ABI)

            # ── 2. Build ABI-encoded ArbParams ────────────────────────────────
            self._emit("INFO", "EXEC", "Building ABI-encoded ArbParams for executeFlashArbitrage()...")
            trade_id_onchain = contract_info.get("trade_count", 0) + 1
            params_bytes = contract_manager.build_arb_params(opp, trade_id_onchain)

            asset_addr  = AsyncWeb3.to_checksum_address(settings.flash_loan_asset)
            amount_raw  = int(opp.input_amount_usd * 1_000_000)  # USDC 6 decimals

            self._emit("INFO", "FLASHLOAN", f"Flash loan: BORROW {amount_raw / 1e6:,.0f} USDC from Aave V3 @ {settings.aave_pool[:10]}...")
            self._emit("INFO", "DEX", f"Route: {opp.buy_dex} → {opp.pair.split('/')[0]} → {opp.sell_dex} → repay Aave")

            # ── 3. Gas estimation (eth_call simulation) ────────────────────────
            self._emit("INFO", "SIMULATION", "Running eth_call simulation (gas estimation)...")
            trade.status = "SIMULATING"

            nonce      = await w3.eth.get_transaction_count(acct.address, "pending")
            gas_price  = await w3.eth.gas_price
            self.nonce = nonce

            try:
                estimated_gas = await contract.functions.executeFlashArbitrage(
                    asset_addr, amount_raw, params_bytes
                ).estimate_gas({"from": acct.address, "gasPrice": gas_price})
                gas_limit = int(estimated_gas * 1.2)  # 20% buffer
                self._emit("INFO", "GAS", f"Simulation OK — estimated gas: {estimated_gas:,} | limit: {gas_limit:,} | price: {AsyncWeb3.from_wei(gas_price,'gwei'):.4f} gwei")
            except Exception as sim_err:
                trade.status = "FAILED"
                trade.error_message = f"eth_call simulation FAILED: {str(sim_err)[:200]}"
                self._emit("ERROR", "SIMULATION", f"❌ Simulation REJECTED: {str(sim_err)[:200]}")
                self._emit("ERROR", "SIMULATION", "Trade aborted — contract would revert on-chain")
                return trade

            # ── 4. Build and sign transaction ─────────────────────────────────
            self._emit("INFO", "EXEC", "Building and signing transaction...")
            trade.status = "SIGNING"

            tx = await contract.functions.executeFlashArbitrage(
                asset_addr, amount_raw, params_bytes
            ).build_transaction({
                "chainId":  settings.chain_id,
                "from":     acct.address,
                "nonce":    nonce,
                "gas":      gas_limit,
                "gasPrice": gas_price,
            })

            signed_tx = acct.sign_transaction(tx)
            self._emit("INFO", "EXEC", f"Transaction signed | nonce={nonce} | gas={gas_limit:,}")

            # ── 5. Broadcast ──────────────────────────────────────────────────
            self._emit("INFO", "TX", "Broadcasting to mempool...")
            trade.status = "PENDING"

            tx_hash = await w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            tx_hash_hex = tx_hash.hex()
            trade.tx_hash = tx_hash_hex
            self._emit("INFO", "TX", f"Submitted TX: {tx_hash_hex}")
            self._emit("INFO", "TX", f"Explorer: {settings.explorer_url}/tx/{tx_hash_hex}")

            # ── 6. Wait for receipt ───────────────────────────────────────────
            self._emit("INFO", "TX", "Waiting for block confirmation...")
            receipt = await w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

            trade.block_number = receipt["blockNumber"]
            trade.gas_used     = receipt["gasUsed"]
            gas_cost_eth       = float(AsyncWeb3.from_wei(receipt["gasUsed"] * gas_price, "ether"))
            # Approximate ETH price from market data for USD conversion
            from backend.bot.market_data import market_data
            eth_price = market_data.get_price("ETH") or 2000.0
            trade.gas_cost_usd = gas_cost_eth * eth_price
            trade.confirmed_at = time.time()

            self._emit("INFO", "TX", f"Confirmed block={receipt['blockNumber']} | gas={receipt['gasUsed']:,} | status={'SUCCESS' if receipt['status'] == 1 else 'REVERTED'}")

            if receipt["status"] != 1:
                trade.status        = "REVERTED"
                trade.error_message = "Transaction reverted on-chain — profit invariant likely failed"
                trade.actual_profit = -trade.gas_cost_usd
                self.total_gas_spent += trade.gas_cost_usd
                self.loss_count += 1
                self._emit("ERROR", "TX", "❌ TX REVERTED — Contract profit invariant or deadline check failed")
                return trade

            # ── 7. Parse ArbitrageExecuted event ──────────────────────────────
            try:
                events = contract.events.ArbitrageExecuted().process_receipt(receipt)
                if events:
                    evt = events[0]["args"]
                    net_profit_raw  = evt["netProfit"]
                    actual_profit   = float(net_profit_raw) / 1_000_000  # USDC 6 decimals
                    trade.actual_profit = actual_profit
                    self._emit("INFO", "EXEC", f"ArbitrageExecuted event: netProfit={actual_profit:.4f} USDC | tradeId={evt['tradeId']}")
                else:
                    # Fallback: use expected profit
                    trade.actual_profit = opp.net_profit
                    self._emit("WARNING", "EXEC", "ArbitrageExecuted event not found — using expected profit")
            except Exception as evt_err:
                trade.actual_profit = opp.net_profit
                self._emit("WARNING", "EXEC", f"Event parsing error: {evt_err} — using expected profit")

            trade.status = "CONFIRMED"
            self.total_profit    += trade.actual_profit
            self.total_gas_spent += trade.gas_cost_usd
            self.win_count += 1
            opp.status = "EXECUTED"

            self._emit("INFO", "EXEC", "=" * 60)
            self._emit("INFO", "EXEC", f"✅ FLASH ARBITRAGE CONFIRMED ON-CHAIN")
            self._emit("INFO", "EXEC", f"   TX:       {tx_hash_hex[:20]}...")
            self._emit("INFO", "EXEC", f"   Block:    {receipt['blockNumber']}")
            self._emit("INFO", "EXEC", f"   Gas:      {receipt['gasUsed']:,} units (${trade.gas_cost_usd:.4f})")
            self._emit("INFO", "EXEC", f"   Expected: +${opp.net_profit:.4f} USDC")
            self._emit("INFO", "EXEC", f"   Actual:   +${trade.actual_profit:.4f} USDC")
            self._emit("INFO", "EXEC", f"   Explorer: {settings.explorer_url}/tx/{tx_hash_hex}")
            self._emit("INFO", "EXEC", "=" * 60)

            return trade

        except Exception as e:
            trade.status = "FAILED"
            trade.error_message = str(e)[:300]
            self._emit("ERROR", "EXEC", f"On-chain execution error: {str(e)[:200]}")
            return trade

    def get_stats(self) -> dict:
        total = self.win_count + self.loss_count
        return {
            "total_trades": total,
            "win_count": self.win_count,
            "loss_count": self.loss_count,
            "win_rate": round(self.win_count / total * 100, 1) if total > 0 else 0,
            "total_profit": round(self.total_profit, 2),
            "total_gas_spent": round(self.total_gas_spent, 4),
            "paper_balance": round(self.paper_balance_usdc, 2),
            "mode": settings.execution_mode,
        }

    def get_recent_trades(self, limit: int = 50) -> List[dict]:
        return [t.to_dict() for t in self.trades[:limit]]

execution_engine = ExecutionEngine()
