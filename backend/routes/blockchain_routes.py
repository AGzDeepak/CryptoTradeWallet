"""
backend/routes/blockchain_routes.py — Multi-Chain RPC & Balance Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from blockchain.ethereum.provider import EthereumProvider
from blockchain.polygon.provider import PolygonProvider
from blockchain.bsc.provider import BSCProvider
from blockchain.solana.provider import SolanaProvider

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Multi-Chain Providers"])

eth_provider = EthereumProvider()
poly_provider = PolygonProvider()
bsc_provider = BSCProvider()
sol_provider = SolanaProvider()


@router.get("/overview")
def get_multichain_overview(address: str = Query(...)):
    """Fetch multi-chain balances for EVM & Solana."""
    try:
        eth_data = eth_provider.get_wallet_overview(address)
        poly_data = poly_provider.get_wallet_overview(address)
        bsc_data = bsc_provider.get_wallet_overview(address)

        total_usd = eth_data["totalUsd"] + poly_data["totalUsd"] + bsc_data["totalUsd"]

        return {
            "address": address,
            "totalEquityUsd": round(total_usd, 2),
            "networks": {
                "ethereum": eth_data,
                "polygon": poly_data,
                "bsc": bsc_data,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
