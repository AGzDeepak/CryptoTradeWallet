"""
backend/routes/wallet_routes.py — FastAPI APIRouter for Decentralized Wallet & Team Vault Endpoints
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from backend.services.wallet_service import DecentralizedWalletService

router = APIRouter(prefix="/api/decentralized-wallet", tags=["Decentralized Wallet"])


@router.get("/generate")
@router.post("/generate")
def generate_wallet(words: int = 12, password: Optional[str] = None):
    """Generate a new 12/24 word non-custodial wallet."""
    try:
        return DecentralizedWalletService.create_new_wallet(words, password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/import")
def import_wallet(payload: Dict[str, Any] = Body(...)):
    """Import wallet via seed phrase."""
    try:
        mnemonic = payload.get("mnemonic", "")
        password = payload.get("password")
        return DecentralizedWalletService.import_wallet_from_mnemonic(mnemonic, password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/team/create-share")
def create_team_share(payload: Dict[str, Any] = Body(...)):
    """Generate password-encrypted Team Share Vault Code."""
    try:
        mnemonic = payload.get("mnemonic", "")
        team_name = payload.get("teamName", "Quant Trading Alpha")
        team_password = payload.get("teamPassword", "")
        if not team_password:
            raise ValueError("Team password is required for encrypted vault sharing.")
        return DecentralizedWalletService.create_team_share_code(mnemonic, team_name, team_password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/team/join-share")
def join_team_share(payload: Dict[str, Any] = Body(...)):
    """Join team wallet vault using team encrypted keystore & password."""
    try:
        keystore = payload.get("keystore")
        team_password = payload.get("teamPassword", "")
        if not keystore or not team_password:
            raise ValueError("Keystore JSON payload and team password are required.")
        return DecentralizedWalletService.join_team_vault(keystore, team_password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sign-transaction")
def sign_transaction(payload: Dict[str, Any] = Body(...)):
    """Sign an offline transaction using private key."""
    try:
        priv = payload.get("privateKey")
        to_addr = payload.get("toAddress")
        amount = float(payload.get("amount", 0))
        network = payload.get("network", "arbitrum")
        return DecentralizedWalletService.build_and_sign_tx(priv, to_addr, amount, network)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
