"""
blockchain/bsc/provider.py — BNB Smart Chain Provider
"""

import json
import urllib.request
from typing import Dict, Any

RPC_URL = "https://bsc-dataseed1.binance.org"


class BSCProvider:
    """BNB Smart Chain Provider."""

    def __init__(self, rpc_url: str = RPC_URL):
        self.rpc_url = rpc_url

    def get_bnb_balance(self, address: str) -> float:
        try:
            req_data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "eth_getBalance", "params": [address, "latest"]}).encode("utf-8")
            req = urllib.request.Request(self.rpc_url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8")).get("result")
                return int(result, 16) / 1e18 if result else 0.0
        except Exception:
            return 0.0

    def get_wallet_overview(self, address: str) -> Dict[str, Any]:
        bnb = self.get_bnb_balance(address)
        return {
            "network": "BNB Smart Chain",
            "address": address,
            "bnbBalance": bnb,
            "totalUsd": round(bnb * 580.40, 2)
        }
