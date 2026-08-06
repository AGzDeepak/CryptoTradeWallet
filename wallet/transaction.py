"""
wallet/transaction.py — Transaction Builder & Fee Estimator
Assembles unsigned transaction payloads, calculates gas/network fees,
and formats transaction objects for EVM and Solana.
"""

from typing import Dict, Any, Optional
from .signer import TransactionSigner

CHAIN_IDS = {
    "ethereum": 1,
    "arbitrum": 42161,
    "polygon": 137,
    "bsc": 56,
    "optimism": 10,
    "solana": 101
}

DEFAULT_GAS_PRICES = {
    "ethereum": 25.0,  # Gwei
    "arbitrum": 0.1,   # Gwei
    "polygon": 35.0,   # Gwei
    "bsc": 3.0,        # Gwei
    "solana": 0.000005 # SOL
}


class TransactionBuilder:
    """Transaction Payload Builder & Gas Estimator Engine."""

    @staticmethod
    def estimate_fee(network: str = "arbitrum", gas_limit: int = 21000) -> Dict[str, Any]:
        """Estimate network gas fees in native asset and USD."""
        net = network.lower()
        gwei_price = DEFAULT_GAS_PRICES.get(net, 1.0)

        if net == "solana":
            fee_native = 0.000005
            fee_usd = fee_native * 184.75
        else:
            fee_native = (gas_limit * gwei_price * 1e9) / 1e18
            eth_price = 3540.20
            fee_usd = fee_native * eth_price

        return {
            "network": network,
            "gasLimit": gas_limit,
            "gasPriceGwei": gwei_price,
            "feeNative": round(fee_native, 8),
            "feeUsd": round(fee_usd, 4),
        }

    @staticmethod
    def build_unsigned_transaction(
        from_address: str,
        to_address: str,
        amount: float,
        token_symbol: str = "USDT",
        network: str = "arbitrum",
        nonce: int = 0
    ) -> Dict[str, Any]:
        """Build unsigned transaction object with gas estimation."""
        fee_info = TransactionBuilder.estimate_fee(network)
        chain_id = CHAIN_IDS.get(network.lower(), 42161)

        return {
            "unsigned": True,
            "network": network,
            "chainId": chain_id,
            "from": from_address,
            "to": to_address,
            "amount": amount,
            "token": token_symbol,
            "nonce": nonce,
            "feeEstimate": fee_info,
            "payload": {
                "to": to_address,
                "value": amount,
                "data": "0x",
                "nonce": nonce,
                "chainId": chain_id
            }
        }

    @classmethod
    def build_and_sign(
        cls,
        private_key: str,
        to_address: str,
        amount: float,
        network: str = "arbitrum",
        nonce: int = 0
    ) -> Dict[str, Any]:
        """Helper to build and immediately sign transaction using private key."""
        fee = cls.estimate_fee(network)
        if network.lower() == "solana":
            return TransactionSigner.sign_solana_transaction(
                private_key=private_key,
                to_address=to_address,
                amount_sol=amount,
                recent_blockhash="GH7s7k21x8n..."
            )
        else:
            chain_id = CHAIN_IDS.get(network.lower(), 42161)
            return TransactionSigner.sign_evm_transaction(
                private_key=private_key,
                to_address=to_address,
                value_eth=amount,
                nonce=nonce,
                gas_price_gwei=fee["gasPriceGwei"],
                chain_id=chain_id
            )


if __name__ == "__main__":
    tx = TransactionBuilder.build_unsigned_transaction("0x123...", "0x456...", 100.0, "USDT", "arbitrum")
    print("Unsigned Tx:", tx)
