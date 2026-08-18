"""
Risk Engine — 18-Point Pre-Execution Safety Validator
Every trade MUST pass all checks before execution.
"""
import logging
import time
from dataclasses import dataclass
from typing import Optional
from backend.config import settings

logger = logging.getLogger("ARB.RISK")

@dataclass
class RiskCheckResult:
    passed: bool
    check_name: str
    reason: str = ""

    def __str__(self):
        status = "PASS" if self.passed else "FAIL"
        return f"[{status}] {self.check_name}: {self.reason}"


class RiskEngine:
    def __init__(self):
        self.emergency_stop = False
        self.daily_loss_usd = 0.0
        self.daily_trade_count = 0
        self.daily_reset_at = time.time()
        self.pending_tx_count = 0
        self.max_pending = 2

    def activate_emergency_stop(self):
        self.emergency_stop = True
        logger.critical("EMERGENCY STOP ACTIVATED — All execution halted")

    def deactivate_emergency_stop(self):
        self.emergency_stop = False
        logger.warning("Emergency stop deactivated")

    def record_loss(self, loss_usd: float):
        """Record a realized loss toward the daily limit."""
        if loss_usd > 0:
            self.daily_loss_usd += loss_usd

    def _reset_daily_if_needed(self):
        if (time.time() - self.daily_reset_at) > 86400:
            self.daily_loss_usd = 0.0
            self.daily_trade_count = 0
            self.daily_reset_at = time.time()

    def validate_opportunity(
        self,
        net_profit_usd: float,
        profit_bps: float,
        gas_cost_usd: float,
        slippage_bps: float,
        price_impact_bps: float,
        liquidity_ok: bool,
        simulation_passed: Optional[bool],
        quote_age_seconds: float,
        trade_size_usd: float,
        buy_dex: str,
        sell_dex: str,
        mode: str = "paper",
    ) -> tuple[bool, list[RiskCheckResult]]:
        """
        Run all 18 risk checks. Returns (all_passed, list_of_results).
        """
        self._reset_daily_if_needed()
        checks = []

        # 1. Emergency stop
        checks.append(RiskCheckResult(
            not self.emergency_stop, "EmergencyStop",
            "OK" if not self.emergency_stop else "EMERGENCY STOP IS ACTIVE"
        ))

        # 2. Execution mode authorization
        if mode == "mainnet":
            authorized = settings.mainnet_enabled and settings.execution_enabled
        elif mode == "testnet":
            authorized = settings.execution_enabled
        else:
            authorized = True  # Paper always allowed
        checks.append(RiskCheckResult(authorized, "ModeAuthorization",
            f"Mode={mode} authorized" if authorized else f"Mode={mode} NOT AUTHORIZED"))

        # 3. Trade size
        size_ok = 0 < trade_size_usd <= settings.max_trade_size
        checks.append(RiskCheckResult(size_ok, "TradeSize",
            f"${trade_size_usd:,.0f} <= ${settings.max_trade_size:,.0f}" if size_ok
            else f"EXCEEDS MAX ${settings.max_trade_size:,.0f}"))

        # 4. Min net profit USD
        profit_ok = net_profit_usd >= settings.min_profit_usd
        checks.append(RiskCheckResult(profit_ok, "MinProfitUSD",
            f"${net_profit_usd:.2f} >= ${settings.min_profit_usd:.2f}" if profit_ok
            else f"${net_profit_usd:.2f} BELOW MINIMUM ${settings.min_profit_usd:.2f}"))

        # 5. Min profit BPS
        bps_ok = profit_bps >= settings.min_profit_bps
        checks.append(RiskCheckResult(bps_ok, "MinProfitBPS",
            f"{profit_bps:.1f} bps >= {settings.min_profit_bps} bps" if bps_ok
            else f"{profit_bps:.1f} bps BELOW MINIMUM {settings.min_profit_bps} bps"))

        # 6. Gas cost vs profit
        gas_ok = gas_cost_usd < net_profit_usd
        checks.append(RiskCheckResult(gas_ok, "GasCost",
            f"${gas_cost_usd:.4f} < ${net_profit_usd:.2f}" if gas_ok
            else f"GAS ${gas_cost_usd:.4f} EXCEEDS PROFIT ${net_profit_usd:.2f}"))

        # 7. Max gas USD
        max_gas_ok = gas_cost_usd <= settings.max_gas_usd
        checks.append(RiskCheckResult(max_gas_ok, "MaxGas",
            f"${gas_cost_usd:.4f} <= ${settings.max_gas_usd:.2f}" if max_gas_ok
            else f"GAS ${gas_cost_usd:.4f} > MAX ${settings.max_gas_usd:.2f}"))

        # 8. Slippage
        slip_ok = slippage_bps <= settings.max_slippage_bps
        checks.append(RiskCheckResult(slip_ok, "Slippage",
            f"{slippage_bps:.0f} bps <= {settings.max_slippage_bps} bps" if slip_ok
            else f"SLIPPAGE {slippage_bps:.0f} bps > MAX {settings.max_slippage_bps} bps"))

        # 9. Price impact
        impact_ok = price_impact_bps <= settings.max_price_impact_bps
        checks.append(RiskCheckResult(impact_ok, "PriceImpact",
            f"{price_impact_bps:.0f} bps <= {settings.max_price_impact_bps} bps" if impact_ok
            else f"IMPACT {price_impact_bps:.0f} bps > MAX {settings.max_price_impact_bps} bps"))

        # 10. Liquidity
        checks.append(RiskCheckResult(liquidity_ok, "Liquidity",
            "Pool liquidity sufficient" if liquidity_ok else "INSUFFICIENT POOL LIQUIDITY"))

        # 11. Stale quote (max 15 seconds)
        fresh = quote_age_seconds <= 15.0
        checks.append(RiskCheckResult(fresh, "QuoteAge",
            f"{quote_age_seconds:.1f}s old" if fresh else f"STALE: {quote_age_seconds:.1f}s > 15s MAX"))

        # 12. Simulation (None = not run yet for paper mode)
        if mode == "paper":
            sim_ok = True
            sim_msg = "Paper mode — simulation not required"
        elif simulation_passed is None:
            sim_ok = False
            sim_msg = "SIMULATION NOT RUN"
        else:
            sim_ok = simulation_passed
            sim_msg = "Simulation passed" if sim_ok else "SIMULATION FAILED — REVERT EXPECTED"
        checks.append(RiskCheckResult(sim_ok, "Simulation", sim_msg))

        # 13. Daily loss limit
        self._reset_daily_if_needed()
        loss_ok = self.daily_loss_usd < settings.max_daily_loss_usd
        checks.append(RiskCheckResult(loss_ok, "DailyLossLimit",
            f"${self.daily_loss_usd:.2f} < ${settings.max_daily_loss_usd:.2f}" if loss_ok
            else f"DAILY LOSS ${self.daily_loss_usd:.2f} >= LIMIT ${settings.max_daily_loss_usd:.2f}"))

        # 14. Pending tx limit
        pending_ok = self.pending_tx_count < self.max_pending
        checks.append(RiskCheckResult(pending_ok, "PendingTxLimit",
            f"{self.pending_tx_count} < {self.max_pending}" if pending_ok
            else f"TOO MANY PENDING: {self.pending_tx_count}"))

        # 15. DEX whitelist
        allowed_dexes = {"Uniswap V3", "SushiSwap", "Camelot DEX", "Balancer V2"}
        dex_ok = buy_dex in allowed_dexes and sell_dex in allowed_dexes
        checks.append(RiskCheckResult(dex_ok, "DexWhitelist",
            f"{buy_dex} / {sell_dex} whitelisted" if dex_ok
            else f"DEX NOT WHITELISTED: {buy_dex} or {sell_dex}"))

        # 16. Transaction value limit
        value_ok = trade_size_usd <= settings.max_transaction_value
        checks.append(RiskCheckResult(value_ok, "MaxTransactionValue",
            f"${trade_size_usd:,.0f} <= ${settings.max_transaction_value:,.0f}" if value_ok
            else f"TX VALUE ${trade_size_usd:,.0f} > LIMIT ${settings.max_transaction_value:,.0f}"))

        # 17. Contract deployed (non-paper only)
        if mode != "paper":
            contract_ok = bool(settings.deployed_contract and len(settings.deployed_contract) == 42)
        else:
            contract_ok = True
        checks.append(RiskCheckResult(contract_ok, "ContractDeployed",
            "Contract address configured" if contract_ok else "CONTRACT NOT DEPLOYED"))

        # 18. Wallet configured (non-paper only)
        if mode != "paper":
            wallet_ok = bool(settings.execution_wallet)
        else:
            wallet_ok = True
        checks.append(RiskCheckResult(wallet_ok, "WalletConfigured",
            "Execution wallet set" if wallet_ok else "EXECUTION WALLET NOT SET"))

        all_passed = all(c.passed for c in checks)

        # Log results
        for c in checks:
            if c.passed:
                logger.debug(str(c))
            else:
                logger.warning(f"RISK REJECTED: {c}")

        return all_passed, checks

risk_engine = RiskEngine()
