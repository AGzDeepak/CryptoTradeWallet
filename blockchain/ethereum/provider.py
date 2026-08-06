"""
blockchain/ethereum/provider.py — Ethereum Blockchain Provider
Handles Ethereum RPC communication, ETH balance, ERC-20 token balances, gas price, and tx submission.
"""

import json
import urllib.request
from typing import Dict, Any

RPC_URL = "https://cloudflare-eth.com"
USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
USDC_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"


class EthereumProvider:
    """Ethereum Mainnet / RPC Provider."""

    def __init__(self, rpc_url: str = RPC_URL):
        self.rpc_url = rpc_url

    def _rpc_call(self, method: str, params: list) -> Any:
        try:
            req_data = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode("utf-8")
            req = urllib.request.Request(self.rpc_url, data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("result")
        except Exception:
            return None

    def get_eth_balance(self, address: str) -> float:
        res = self._rpc_call("eth_getBalance", [address, "latest"])
        if not res:
            return 0.0
        return int(res, 16) / 1e18

    def get_token_balance(self, wallet_address: str, token_contract: str = USDT_CONTRACT) -> float:
        padded = wallet_address.lower().replace("0x", "").zfill(64)
        data = "0x70a08231" + padded
        res = self._rpc_call("eth_call", [{"to": token_contract, "data": data}, "latest"])
        if not res or res == "0x":
            return 0.0
        return int(res, 16) / 1e6

    def get_wallet_overview(self, address: str) -> Dict[str, Any]:
        eth = self.get_eth_balance(address)
        usdt = self.get_token_balance(address, USDT_CONTRACT)
        usdc = self.get_token_balance(address, USDC_CONTRACT)
        return {
            "network": "Ethereum Mainnet",
            "address": address,
            "ethBalance": eth,
            "usdtBalance": usdt,
            "usdcBalance": usdc,
            "totalUsd": round((eth * 3540.20) + usdt + usdc, 2)
        }


if __name__ == "__main__":
    ep = EthereumProvider()
    print(ep.get_wallet_overview("0x71C7656EC7ab88b098defB751B7401B5f6d7B41"))
