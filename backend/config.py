"""
Production Configuration — Flash Arbitrage Engine
Loads and validates all environment variables.
"""
import os
from decimal import Decimal
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Literal
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # RPC
    rpc_url: str = Field(default="", env="RPC_URL")
    ws_rpc_url: str = Field(default="", env="WS_RPC_URL")
    chain_id: int = Field(default=421614, env="CHAIN_ID")

    # Wallet (server-side only)
    private_key: str = Field(default="", env="PRIVATE_KEY")
    execution_wallet: str = Field(default="", env="EXECUTION_WALLET")

    # Aave
    aave_pool_addresses_provider: str = Field(default="0xd6328Fb9B5b7D3c17Df9eF71B7A86Aef70b7E31", env="AAVE_POOL_ADDRESSES_PROVIDER")
    aave_pool: str = Field(default="0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff", env="AAVE_POOL")

    # Flash loan
    flash_loan_asset: str = Field(default="0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", env="FLASH_LOAN_ASSET")
    flash_loan_asset_symbol: str = Field(default="USDC", env="FLASH_LOAN_ASSET_SYMBOL")

    # DEX routers
    uniswap_v3_router: str = Field(default="0x101F443B4d1b059569D643917553c771E1b9663E", env="UNISWAP_V3_ROUTER")
    uniswap_v3_quoter: str = Field(default="0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B", env="UNISWAP_V3_QUOTER")
    sushiswap_router: str = Field(default="0xeaBcE3E74EF19FB48d42137578B69dFe40b8BEb5", env="SUSHISWAP_ROUTER")

    # Contract
    deployed_contract: str = Field(default="", env="DEPLOYED_CONTRACT")

    # Mode
    execution_mode: Literal["paper", "testnet", "mainnet"] = Field(default="paper", env="EXECUTION_MODE")
    mainnet_enabled: bool = Field(default=False, env="MAINNET_ENABLED")
    execution_enabled: bool = Field(default=False, env="EXECUTION_ENABLED")
    dry_run: bool = Field(default=True, env="DRY_RUN")

    # Risk
    min_profit_usd: float = Field(default=5.0, env="MIN_PROFIT_USD")
    min_profit_bps: int = Field(default=10, env="MIN_PROFIT_BPS")
    max_slippage_bps: int = Field(default=200, env="MAX_SLIPPAGE_BPS")
    max_gas_usd: float = Field(default=10.0, env="MAX_GAS_USD")
    max_price_impact_bps: int = Field(default=300, env="MAX_PRICE_IMPACT_BPS")
    max_daily_loss_usd: float = Field(default=500.0, env="MAX_DAILY_LOSS_USD")
    max_transaction_value: float = Field(default=100_000.0, env="MAX_TRANSACTION_VALUE")
    max_trade_size: float = Field(default=250_000.0, env="MAX_TRADE_SIZE")

    # DB
    database_url: str = Field(default="sqlite+aiosqlite:///./flash_arb.db", env="DATABASE_URL")

    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    # Paper trading virtual balance
    paper_balance_usdc: float = 100_000.0
    paper_balance_eth: float = 10.0

    model_config = {"env_file": ".env", "case_sensitive": False}

    @property
    def is_mainnet(self) -> bool:
        return self.execution_mode == "mainnet"

    @property
    def is_paper(self) -> bool:
        return self.execution_mode == "paper"

    @property
    def can_execute(self) -> bool:
        if self.is_paper:
            return True
        if self.is_mainnet and not (self.mainnet_enabled and self.execution_enabled):
            return False
        return self.execution_enabled

    @property
    def chain_name(self) -> str:
        names = {
            1: "Ethereum Mainnet",
            42161: "Arbitrum One",
            421614: "Arbitrum Sepolia",
            11155111: "Ethereum Sepolia",
        }
        return names.get(self.chain_id, f"Chain {self.chain_id}")

    @property
    def explorer_url(self) -> str:
        explorers = {
            1: "https://etherscan.io",
            42161: "https://arbiscan.io",
            421614: "https://sepolia.arbiscan.io",
            11155111: "https://sepolia.etherscan.io",
        }
        return explorers.get(self.chain_id, "https://etherscan.io")

settings = Settings()
