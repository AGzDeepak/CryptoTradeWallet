"""
backend/services/wallet_service.py — Wallet Core Service Bridge & Team Vault Engine
"""

from typing import Dict, Any, List
import sys
import os
import json
import base64
import secrets

# Add root folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from wallet.mnemonic import BIP39Engine
from wallet.keygen import KeypairGenerator
from wallet.encryption import KeystoreEncryptor
from wallet.signer import TransactionSigner
from wallet.transaction import TransactionBuilder
from blockchain.ethereum.provider import EthereumProvider


class DecentralizedWalletService:
    """Business logic for non-custodial wallet management and team vault sharing."""

    @staticmethod
    def create_new_wallet(words: int = 12, password: str = None) -> Dict[str, Any]:
        """Generate a brand new 12/24 word decentralized wallet."""
        mnemonic = BIP39Engine.generate_mnemonic(words)
        bundle = KeypairGenerator.generate_full_multichain_wallet(mnemonic)

        encrypted_keystore = None
        if password:
            encrypted_keystore = KeystoreEncryptor.encrypt_keystore(bundle, password)

        return {
            "success": True,
            "mnemonic": mnemonic,
            "evmAddress": bundle["evmAddress"],
            "solanaAddress": bundle["solanaAddress"],
            "keystore": encrypted_keystore
        }

    @staticmethod
    def import_wallet_from_mnemonic(mnemonic: str, password: str = None) -> Dict[str, Any]:
        """Import wallet using an existing 12 or 24 word BIP-39 mnemonic seed phrase."""
        if not BIP39Engine.validate_mnemonic(mnemonic):
            raise ValueError("Invalid BIP-39 mnemonic seed phrase format.")

        bundle = KeypairGenerator.generate_full_multichain_wallet(mnemonic)

        encrypted_keystore = None
        if password:
            encrypted_keystore = KeystoreEncryptor.encrypt_keystore(bundle, password)

        return {
            "success": True,
            "imported": True,
            "evmAddress": bundle["evmAddress"],
            "solanaAddress": bundle["solanaAddress"],
            "keystore": encrypted_keystore
        }

    @staticmethod
    def create_team_share_code(mnemonic: str, team_name: str, team_password: str) -> Dict[str, Any]:
        """
        Encrypt seed phrase into a portable Team Sharing Code (`TEAM-VAULT-...`)
        that team members can enter along with the team password.
        """
        if not BIP39Engine.validate_mnemonic(mnemonic):
            raise ValueError("Invalid seed phrase.")

        bundle = KeypairGenerator.generate_full_multichain_wallet(mnemonic)
        keystore = KeystoreEncryptor.encrypt_keystore({
            "mnemonic": mnemonic,
            "teamName": team_name,
            "evmAddress": bundle["evmAddress"],
            "solanaAddress": bundle["solanaAddress"]
        }, team_password)

        raw_b64 = base64.b64encode(json.dumps(keystore).encode("utf-8")).decode("utf-8")
        team_code = f"TEAM-VAULT-{raw_b64[:32]}-{secrets.token_hex(4).upper()}"

        return {
            "success": True,
            "teamName": team_name,
            "teamShareCode": team_code,
            "encryptedKeystore": keystore,
            "evmAddress": bundle["evmAddress"],
            "solanaAddress": bundle["solanaAddress"]
        }

    @staticmethod
    def join_team_vault(keystore: Dict[str, Any], team_password: str) -> Dict[str, Any]:
        """Decrypt team vault payload with team password to join team wallet."""
        decrypted = KeystoreEncryptor.decrypt_keystore(keystore, team_password)
        mnemonic = decrypted["mnemonic"]
        bundle = KeypairGenerator.generate_full_multichain_wallet(mnemonic)

        return {
            "success": True,
            "joined": True,
            "teamName": decrypted.get("teamName", "Quant Trading Team"),
            "mnemonic": mnemonic,
            "evmAddress": bundle["evmAddress"],
            "solanaAddress": bundle["solanaAddress"]
        }

    @staticmethod
    def build_and_sign_tx(
        private_key: str,
        to_address: str,
        amount: float,
        network: str = "arbitrum"
    ) -> Dict[str, Any]:
        """Build and sign an off-chain transaction."""
        return TransactionBuilder.build_and_sign(
            private_key=private_key,
            to_address=to_address,
            amount=amount,
            network=network
        )
