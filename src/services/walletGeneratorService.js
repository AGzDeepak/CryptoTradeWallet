import { ethers } from 'ethers';

/**
 * walletGeneratorService.js
 * Professional Real-Time Cryptographic Web3 Wallet Generation Engine
 * Uses ethers.js v6 for BIP-39 standard mnemonic, private key, and public address derivation.
 */

// Generate a cryptographically secure random wallet with 12-word BIP-39 mnemonic
export const generateNewWallet = () => {
  try {
    const randomWallet = ethers.Wallet.createRandom();
    const mnemonicObj = randomWallet.mnemonic;
    const phrase = mnemonicObj ? mnemonicObj.phrase : '';
    const words = phrase.split(' ');

    return {
      address: randomWallet.address,
      privateKey: randomWallet.privateKey,
      mnemonic: phrase,
      words: words,
      path: mnemonicObj?.path || "m/44'/60'/0'/0/0",
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to generate cryptographic wallet:', error);
    throw new Error('Cryptographic entropy generation failed: ' + error.message);
  }
};

// Restore wallet from 12 or 24 word mnemonic phrase
export const restoreWalletFromPhrase = (phrase) => {
  try {
    const cleaned = phrase.trim().replace(/\s+/g, ' ');
    const restored = ethers.Wallet.fromPhrase(cleaned);
    return {
      address: restored.address,
      privateKey: restored.privateKey,
      mnemonic: cleaned,
      words: cleaned.split(' '),
      path: restored.mnemonic?.path || "m/44'/60'/0'/0/0",
      restoredAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error('Invalid Recovery Phrase: ' + error.message);
  }
};

// Restore wallet from hex Private Key
export const restoreWalletFromPrivateKey = (privateKey) => {
  try {
    let key = privateKey.trim();
    if (!key.startsWith('0x')) key = '0x' + key;
    const wallet = new ethers.Wallet(key);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: null,
      words: [],
      restoredAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error('Invalid Private Key: ' + error.message);
  }
};

// Encrypt and export Keystore JSON (V3 format)
export const exportEncryptedKeystoreJson = async (walletInstance, password) => {
  try {
    let walletObj = walletInstance;
    if (typeof walletInstance === 'string') {
      walletObj = new ethers.Wallet(walletInstance);
    } else if (walletInstance.privateKey) {
      walletObj = new ethers.Wallet(walletInstance.privateKey);
    }
    const jsonStr = await walletObj.encrypt(password);
    return jsonStr;
  } catch (error) {
    throw new Error('Failed to encrypt keystore JSON: ' + error.message);
  }
};

// Local storage vault management
const VAULT_STORAGE_KEY = 'chainblock_encrypted_wallets';

export const getStoredVaultWallets = () => {
  try {
    const data = localStorage.getItem(VAULT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (_) {
    return [];
  }
};

export const saveWalletToVault = (walletEntry) => {
  try {
    const existing = getStoredVaultWallets();
    // Prevent duplicates by address
    const filtered = existing.filter(w => w.address.toLowerCase() !== walletEntry.address.toLowerCase());
    const updated = [
      {
        id: `WALLET-${Date.now()}`,
        name: walletEntry.name || `Account ${filtered.length + 1}`,
        address: walletEntry.address,
        createdAt: new Date().toISOString(),
        isGenerated: true,
        // Store non-sensitive metadata (private keys can be encrypted in keystore)
        hasMnemonic: !!walletEntry.mnemonic,
      },
      ...filtered
    ];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save wallet to vault:', err);
    return [];
  }
};
