"""
backend/app/config.py — Application Configurations & Constants
"""

import os

APP_NAME = "Decentralized Crypto Wallet API"
VERSION = "2.0.0"
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

SUPPORTED_NETWORKS = ["ethereum", "arbitrum", "polygon", "bsc", "solana"]

DEFAULT_RPC_ENDPOINTS = {
    "ethereum": "https://cloudflare-eth.com",
    "arbitrum": "https://arb1.arbitrum.io/rpc",
    "polygon":  "https://polygon-rpc.com",
    "bsc":      "https://bsc-dataseed1.binance.org",
    "solana":   "https://api.mainnet-beta.solana.com"
}
