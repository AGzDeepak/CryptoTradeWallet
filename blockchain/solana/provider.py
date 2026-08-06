"""
blockchain/solana/provider.py — Solana RPC Provider
"""

import json
import urllib.request
from typing import Dict, Any

RPC_URL = "https://api.mainnet-beta.solana.com"


class SolanaProvider:
    """Solana Mainnet Provider."""

    def __init__(self, rpc_url: str = RPC_URL):
        self.rpc_url = rpc_url

    def get_sol_balance(self, address: str) -> float:
        try:
            req_data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "getBalance", "params": [address]}).encode("utf-8")
            req = urllib.request.Request(self.rpc_url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8")).get("result")
                return result.get("value", 0) / 1e9 if result else 0.0
        except Exception:
            return 0.0

    def get_wallet_overview(self, address: str) -> Dict[str, Any]:
        sol = self.get_sol_balance(address)
        return {
            "network": "Solana Mainnet",
            "address": address,
            "solBalance": sol,
            "totalUsd": round(sol * 184.75, 2)
        }
