"""
blockchain/polygon/provider.py — Polygon POS Blockchain Provider
"""

import json
import urllib.request
from typing import Dict, Any

RPC_URL = "https://polygon-rpc.com"


class PolygonProvider:
    """Polygon POS Provider."""

    def __init__(self, rpc_url: str = RPC_URL):
        self.rpc_url = rpc_url

    def get_matic_balance(self, address: str) -> float:
        try:
            req_data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "eth_getBalance", "params": [address, "latest"]}).encode("utf-8")
            req = urllib.request.Request(self.rpc_url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8")).get("result")
                return int(result, 16) / 1e18 if result else 0.0
        except Exception:
            return 0.0

    def get_wallet_overview(self, address: str) -> Dict[str, Any]:
        matic = self.get_matic_balance(address)
        return {
            "network": "Polygon POS",
            "address": address,
            "maticBalance": matic,
            "totalUsd": round(matic * 0.72, 2)
        }
