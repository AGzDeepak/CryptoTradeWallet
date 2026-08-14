import { ethers } from 'ethers';

/**
 * walletAuthService.js
 * Cryptographic Wallet-Signature Authentication Service for Auto Trade
 *
 * Flow:
 * 1. Request nonce message from session manager
 * 2. Prompt user to sign nonce via MetaMask (personal_sign)
 * 3. Verify signature cryptographically using ethers.verifyMessage
 * 4. Return authenticated session object
 */

const SESSION_KEY = 'cryptobot_autotrade_session';

export const generateAuthNonce = (address) => {
  const nonce = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  const timestamp = new Date().toISOString();
  const message = 
    `CryptoBot Auto Trade Authentication\n` +
    `Wallet: ${address}\n` +
    `Nonce: ${nonce}\n` +
    `Timestamp: ${timestamp}\n\n` +
    `Signing this message authenticates your session for automated trading risk management controls. No funds will be transferred by signing this message.`;
  
  return { nonce, timestamp, message };
};

export const requestWalletSignature = async (address, message) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask browser extension is not installed.');
  }

  try {
    // Request personal_sign from MetaMask
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
    return signature;
  } catch (err) {
    if (err.code === 4001) {
      throw new Error('Wallet signature request was rejected in MetaMask.');
    }
    throw new Error(err.message || 'Signature request failed.');
  }
};

export const verifyWalletSignature = (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    
    if (!isValid) {
      throw new Error(`Signature verification failed. Recovered address ${recoveredAddress} does not match ${expectedAddress}.`);
    }

    return {
      isValid: true,
      recoveredAddress,
      authenticatedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message || 'Cryptographic signature verification failed.',
    };
  }
};

export const saveAuthSession = (address, signature, message) => {
  const session = {
    address,
    signature,
    message,
    authenticatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) {}
  return session;
};

export const getStoredAuthSession = (address) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.address || !session.expiresAt) return null;
    
    // Check if session belongs to currently connected address & is not expired
    if (session.address.toLowerCase() !== (address || '').toLowerCase()) return null;
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch (_) {
    return null;
  }
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
};
