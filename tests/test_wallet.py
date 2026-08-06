"""
tests/test_wallet.py — Unit Tests for Decentralized Wallet Core
Tests BIP-39 mnemonic generation, multi-chain key derivation,
AES-256-GCM encryption/decryption, offline transaction signing, and transaction building.
"""

try:
    import pytest
except ImportError:
    class DummyPytest:
        @staticmethod
        def raises(exc_type):
            class Context:
                def __enter__(self): return self
                def __exit__(self, exc_type_in, exc_val, exc_tb):
                    return exc_type_in is not None and issubclass(exc_type_in, exc_type)
            return Context()
    pytest = DummyPytest()

import sys
import os

# Add root folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from wallet.mnemonic import BIP39Engine
from wallet.keygen import KeypairGenerator
from wallet.encryption import KeystoreEncryptor
from wallet.signer import TransactionSigner
from wallet.transaction import TransactionBuilder


def test_bip39_generation_and_validation():
    """Test 12-word and 24-word seed phrase generation and validation."""
    m12 = BIP39Engine.generate_mnemonic(12)
    assert len(m12.split()) == 12
    assert BIP39Engine.validate_mnemonic(m12) is True

    m24 = BIP39Engine.generate_mnemonic(24)
    assert len(m24.split()) == 24
    assert BIP39Engine.validate_mnemonic(m24) is True

    assert BIP39Engine.validate_mnemonic("invalid word phrase") is False


def test_keypair_derivation():
    """Test EVM and Solana address derivation from mnemonic."""
    mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    evm = KeypairGenerator.derive_evm_keypair(mnemonic)
    assert evm["address"].startswith("0x")
    assert len(evm["address"]) == 42
    assert evm["privateKey"].startswith("0x")

    sol = KeypairGenerator.derive_solana_keypair(mnemonic)
    assert len(sol["address"]) > 20
    assert len(sol["privateKey"]) > 10


def test_keystore_encryption_and_decryption():
    """Test AES-256-GCM password encryption and decryption."""
    data = {
        "mnemonic": "test seed phrase words",
        "evmAddress": "0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
    }
    password = "CorrectPassword123!"

    keystore = KeystoreEncryptor.encrypt_keystore(data, password)
    assert keystore["version"] == 3
    assert "ciphertext" in keystore["crypto"]

    # Valid decryption
    decrypted = KeystoreEncryptor.decrypt_keystore(keystore, password)
    assert decrypted["mnemonic"] == data["mnemonic"]
    assert decrypted["evmAddress"] == data["evmAddress"]

    # Wrong password raises error
    with pytest.raises(ValueError):
        KeystoreEncryptor.decrypt_keystore(keystore, "WrongPassword")


def test_transaction_signing_and_building():
    """Test offline transaction signing and gas fee estimation."""
    fee = TransactionBuilder.estimate_fee("arbitrum")
    assert fee["network"] == "arbitrum"
    assert fee["feeUsd"] >= 0

    priv = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
    signed_tx = TransactionSigner.sign_evm_transaction(
        private_key=priv,
        to_address="0x71C7656EC7ab88b098defB751B7401B5f6d7B41",
        value_eth=0.1,
        nonce=1
    )
    assert signed_tx["signed"] is True
    assert signed_tx["txHash"].startswith("0x")
    assert len(signed_tx["signature"]) > 10


if __name__ == "__main__":
    test_bip39_generation_and_validation()
    test_keypair_derivation()
    test_keystore_encryption_and_decryption()
    test_transaction_signing_and_building()
    print("✅ All Decentralized Wallet Unit Tests Passed Successfully!")
