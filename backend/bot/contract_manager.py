"""
Contract Manager — FlashArbitrageExecutor on-chain interaction layer

Handles:
  - Contract address configuration and validation
  - On-chain deployment verification (calls tradeCount + AAVE_POOL)
  - ABI-encoded ArbParams construction for executeFlashArbitrage()
  - Contract state queries (owner, beneficiary, paused, tradeCount, authorizedRouters)
  - Full on-chain execution with receipt parsing
"""
import logging
import time
import json
from typing import Optional, Tuple
from backend.config import settings

logger = logging.getLogger("ARB.CONTRACT")

# ─── FlashArbitrageExecutor ABI ────────────────────────────────────────────────
# Minimal ABI for all required function calls and event parsing

FLASH_ARB_ABI = [
    # State variables / views
    {"type":"function","name":"AAVE_POOL","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
    {"type":"function","name":"owner","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
    {"type":"function","name":"beneficiary","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
    {"type":"function","name":"tradeCount","inputs":[],"outputs":[{"type":"uint256"}],"stateMutability":"view"},
    {"type":"function","name":"paused","inputs":[],"outputs":[{"type":"bool"}],"stateMutability":"view"},
    {"type":"function","name":"minProfitBps","inputs":[],"outputs":[{"type":"uint256"}],"stateMutability":"view"},
    {"type":"function","name":"maxTradeSizeUsd","inputs":[],"outputs":[{"type":"uint256"}],"stateMutability":"view"},
    {"type":"function","name":"authorizedRouters","inputs":[{"name":"","type":"address"}],"outputs":[{"type":"bool"}],"stateMutability":"view"},
    # Main execution entry point
    {
        "type": "function",
        "name": "executeFlashArbitrage",
        "inputs": [
            {"name": "asset",  "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "params", "type": "bytes"},
        ],
        "outputs": [],
        "stateMutability": "nonpayable",
    },
    # Events
    {
        "type": "event",
        "name": "ArbitrageExecuted",
        "inputs": [
            {"name": "tradeId",     "type": "uint256", "indexed": True},
            {"name": "borrowed",    "type": "uint256", "indexed": False},
            {"name": "repaid",      "type": "uint256", "indexed": False},
            {"name": "netProfit",   "type": "uint256", "indexed": False},
            {"name": "beneficiary", "type": "address", "indexed": False},
            {"name": "ts",          "type": "uint256", "indexed": False},
        ],
        "anonymous": False,
    },
    {
        "type": "event",
        "name": "ArbitrageFailed",
        "inputs": [
            {"name": "tradeId", "type": "uint256", "indexed": True},
            {"name": "reason",  "type": "string",  "indexed": False},
            {"name": "ts",      "type": "uint256", "indexed": False},
        ],
        "anonymous": False,
    },
    # Admin
    {"type":"function","name":"emergencyStop","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
    {"type":"function","name":"resume","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
    {"type":"function","name":"authorizeRouter","inputs":[{"name":"r","type":"address"},{"name":"auth","type":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
]

# ArbParams struct tuple for ABI encoding
ARB_PARAMS_TUPLE = [
    ("tradeId",    "uint256"),
    ("asset",      "address"),
    ("dexARouter", "address"),
    ("dexAType",   "uint8"),   # 0=UniswapV2, 1=UniswapV3
    ("tokenMid",   "address"),
    ("dexAFee",    "uint24"),
    ("minOutA",    "uint256"),
    ("dexBRouter", "address"),
    ("dexBType",   "uint8"),
    ("dexBFee",    "uint24"),
    ("minOutB",    "uint256"),
    ("minNetProfit","uint256"),
    ("deadline",   "uint256"),
]


class ContractStatus:
    NOT_CONFIGURED = "NOT_CONFIGURED"   # No DEPLOYED_CONTRACT in .env
    DEPLOYED       = "DEPLOYED"          # Address set + on-chain calls succeed
    NOT_DEPLOYED   = "NOT_DEPLOYED"      # Address set but on-chain calls fail
    UNREACHABLE    = "UNREACHABLE"       # RPC error / no connection
    PAPER_MODE     = "PAPER_MODE"        # Paper mode — no contract needed


class ContractManager:
    def __init__(self):
        self._cached_info: Optional[dict] = None
        self._cache_ts: float = 0
        self._cache_ttl: float = 30.0  # Re-verify every 30s

    @property
    def contract_address(self) -> str:
        return settings.deployed_contract or ""

    @property
    def is_configured(self) -> bool:
        addr = self.contract_address
        return bool(addr) and len(addr) == 42 and addr.startswith("0x")

    async def get_web3_and_contract(self):
        """Return (w3, contract) or raise if misconfigured."""
        if not settings.rpc_url:
            raise RuntimeError("RPC_URL not set in .env")
        from web3 import AsyncWeb3
        w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(settings.rpc_url))
        if not self.is_configured:
            raise RuntimeError("DEPLOYED_CONTRACT not set in .env")
        contract = w3.eth.contract(
            address=AsyncWeb3.to_checksum_address(self.contract_address),
            abi=FLASH_ARB_ABI
        )
        return w3, contract

    async def verify_onchain(self) -> dict:
        """
        Live on-chain verification. Calls AAVE_POOL(), tradeCount(), paused().
        Returns full contract info dict.
        """
        if settings.is_paper:
            return {
                "status": ContractStatus.PAPER_MODE,
                "address": None,
                "message": "Paper mode — no contract required",
                "chain": settings.chain_name,
                "chain_id": settings.chain_id,
                "explorer_url": None,
                "timestamp": time.time(),
            }

        if not self.is_configured:
            return {
                "status": ContractStatus.NOT_CONFIGURED,
                "address": None,
                "message": "DEPLOYED_CONTRACT not set in .env — deploy FlashArbitrageExecutor.sol first",
                "chain": settings.chain_name,
                "chain_id": settings.chain_id,
                "explorer_url": None,
                "timestamp": time.time(),
            }

        if not settings.rpc_url:
            return {
                "status": ContractStatus.UNREACHABLE,
                "address": self.contract_address,
                "message": "RPC_URL not configured — add it to .env",
                "chain": settings.chain_name,
                "chain_id": settings.chain_id,
                "explorer_url": None,
                "timestamp": time.time(),
            }

        try:
            from web3 import AsyncWeb3
            w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(settings.rpc_url))

            # Check RPC connectivity
            chain_id = await w3.eth.chain_id
            if chain_id != settings.chain_id:
                return {
                    "status": ContractStatus.UNREACHABLE,
                    "address": self.contract_address,
                    "message": f"Chain ID mismatch: RPC={chain_id} vs config={settings.chain_id}",
                    "chain": settings.chain_name,
                    "chain_id": settings.chain_id,
                    "explorer_url": None,
                    "timestamp": time.time(),
                }

            checksum_addr = AsyncWeb3.to_checksum_address(self.contract_address)
            contract = w3.eth.contract(address=checksum_addr, abi=FLASH_ARB_ABI)

            # Check bytecode exists at address
            code = await w3.eth.get_code(checksum_addr)
            if code == b'' or code == b'0x':
                return {
                    "status": ContractStatus.NOT_DEPLOYED,
                    "address": self.contract_address,
                    "message": f"No contract code at {self.contract_address} on {settings.chain_name}",
                    "chain": settings.chain_name,
                    "chain_id": settings.chain_id,
                    "explorer_url": f"{settings.explorer_url}/address/{self.contract_address}",
                    "timestamp": time.time(),
                }

            # Read contract state
            aave_pool   = await contract.functions.AAVE_POOL().call()
            owner       = await contract.functions.owner().call()
            beneficiary = await contract.functions.beneficiary().call()
            trade_count = await contract.functions.tradeCount().call()
            is_paused   = await contract.functions.paused().call()
            min_profit  = await contract.functions.minProfitBps().call()
            max_size    = await contract.functions.maxTradeSizeUsd().call()

            # Check authorized routers
            router_statuses = {}
            for name, addr in {
                "Uniswap V3":  settings.uniswap_v3_router,
                "SushiSwap":   settings.sushiswap_router,
            }.items():
                if addr and len(addr) == 42:
                    try:
                        authorized = await contract.functions.authorizedRouters(
                            AsyncWeb3.to_checksum_address(addr)
                        ).call()
                        router_statuses[name] = {"address": addr, "authorized": authorized}
                    except Exception:
                        router_statuses[name] = {"address": addr, "authorized": False}

            # ETH balance of contract
            eth_balance_wei = await w3.eth.get_balance(checksum_addr)
            eth_balance = float(AsyncWeb3.from_wei(eth_balance_wei, 'ether'))

            info = {
                "status": ContractStatus.DEPLOYED,
                "address": self.contract_address,
                "checksum_address": checksum_addr,
                "message": f"Contract DEPLOYED and VERIFIED on {settings.chain_name}",
                "chain": settings.chain_name,
                "chain_id": chain_id,
                "explorer_url": f"{settings.explorer_url}/address/{self.contract_address}",
                "aave_pool": aave_pool,
                "owner": owner,
                "beneficiary": beneficiary,
                "trade_count": trade_count,
                "is_paused": is_paused,
                "min_profit_bps": min_profit,
                "max_trade_size_usd": max_size,
                "eth_balance": eth_balance,
                "authorized_routers": router_statuses,
                "timestamp": time.time(),
            }
            self._cached_info = info
            self._cache_ts = time.time()
            logger.info(f"Contract verified: {self.contract_address} on {settings.chain_name} | trades={trade_count} | paused={is_paused}")
            return info

        except Exception as e:
            logger.error(f"Contract verification error: {e}")
            return {
                "status": ContractStatus.UNREACHABLE,
                "address": self.contract_address,
                "message": f"RPC/contract error: {str(e)[:200]}",
                "chain": settings.chain_name,
                "chain_id": settings.chain_id,
                "explorer_url": f"{settings.explorer_url}/address/{self.contract_address}" if self.is_configured else None,
                "timestamp": time.time(),
            }

    async def get_status(self) -> dict:
        """Return cached info if fresh, otherwise re-verify."""
        if self._cached_info and (time.time() - self._cache_ts) < self._cache_ttl:
            return self._cached_info
        return await self.verify_onchain()

    def build_arb_params(self, opp, trade_id: int) -> bytes:
        """
        ABI-encode ArbParams struct for executeFlashArbitrage().
        Uses Uniswap V3 for both legs (fee 500 = 0.05% tier).
        """
        from eth_abi import encode
        from eth_utils import to_checksum_address

        deadline = int(time.time()) + 30  # 30s deadline

        # Determine routers: Uniswap V3 for buy, Sushi (V2) for sell
        dex_a_router = settings.uniswap_v3_router
        dex_b_router = settings.sushiswap_router
        dex_a_type   = 1   # UniswapV3
        dex_b_type   = 0   # UniswapV2 (SushiSwap is V2 interface)

        # Token addresses (Arbitrum Sepolia testnet)
        TOKENS = {
            "ETH":  "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",  # WETH Arb Sepolia
            "WETH": "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
            "USDC": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",  # USDC Arb Sepolia
            "USDT": "0x7d98346b3b000c55904918e3d9e2fc3f94683b01",
            "WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "LINK": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
        }

        pair_parts = opp.pair.split("/")
        token_a_sym = pair_parts[0] if len(pair_parts) >= 1 else "WETH"
        token_b_sym = pair_parts[1] if len(pair_parts) >= 2 else "USDC"

        asset_addr    = to_checksum_address(settings.flash_loan_asset)
        token_mid_addr = to_checksum_address(TOKENS.get(token_a_sym, TOKENS["WETH"]))

        # Amount in token decimals (USDC = 6 decimals)
        amount_raw = int(opp.input_amount_usd * 1_000_000)  # USDC 6 decimals
        min_out_a  = int(amount_raw * 0.995)   # 0.5% slippage
        min_out_b  = int(amount_raw * 1.001)   # Must recover at least principal + small profit
        min_profit = int(opp.net_profit * 1_000_000 * 0.5)  # 50% of expected profit as minimum

        params_tuple = (
            trade_id,                                      # tradeId
            to_checksum_address(asset_addr),               # asset
            to_checksum_address(dex_a_router),             # dexARouter
            dex_a_type,                                    # dexAType
            to_checksum_address(token_mid_addr),           # tokenMid
            500,                                           # dexAFee (0.05% Uniswap V3 pool)
            min_out_a,                                     # minOutA
            to_checksum_address(dex_b_router),             # dexBRouter
            dex_b_type,                                    # dexBType
            3000,                                          # dexBFee
            min_out_b,                                     # minOutB
            min_profit,                                    # minNetProfit
            deadline,                                      # deadline
        )

        # Encode as ABI tuple
        encoded = encode(
            ["(uint256,address,address,uint8,address,uint24,uint256,address,uint8,uint24,uint256,uint256,uint256)"],
            [params_tuple]
        )
        return encoded

    def get_abi_json(self) -> str:
        """Return the contract ABI as formatted JSON string."""
        return json.dumps(FLASH_ARB_ABI, indent=2)

    def get_deploy_instructions(self) -> dict:
        """Return instructions for deploying the contract."""
        return {
            "method": "Remix IDE",
            "url": "https://remix.ethereum.org",
            "steps": [
                "1. Open Remix IDE → New file → paste FlashArbitrageExecutor.sol",
                "2. Install OpenZeppelin: npm install @openzeppelin/contracts",
                "3. Compile with Solidity 0.8.20",
                f"4. Deploy to {settings.chain_name} with MetaMask",
                f"5. Constructor args: _provider={settings.aave_pool_addresses_provider}, _beneficiary=<your_wallet>",
                "6. After deploy — copy contract address to DEPLOYED_CONTRACT in .env",
                f"7. Call authorizeRouter({settings.uniswap_v3_router}, true) for Uniswap V3",
                f"8. Call authorizeRouter({settings.sushiswap_router}, true) for SushiSwap",
            ],
            "constructor_args": {
                "_provider": settings.aave_pool_addresses_provider,
                "_beneficiary": settings.execution_wallet or "<your_wallet_address>",
            },
            "chain": settings.chain_name,
            "chain_id": settings.chain_id,
        }


contract_manager = ContractManager()
