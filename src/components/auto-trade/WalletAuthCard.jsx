import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, LogOut, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  generateAuthNonce, 
  requestWalletSignature, 
  verifyWalletSignature, 
  saveAuthSession, 
  clearAuthSession 
} from '../../services/walletAuthService';

const shortenAddr = (addr) => {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const WalletAuthCard = ({
  walletAddress,
  onConnectWallet,
  networkMode, // 'TESTNET' | 'MAINNET'
  onSwitchNetworkMode,
  authSession,
  setAuthSession,
  addNotification
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuthenticate = async () => {
    if (!walletAddress) {
      setAuthError('Connect MetaMask first.');
      return;
    }
    setIsAuthenticating(true);
    setAuthError('');

    try {
      // 1. Generate nonce message
      const { message } = generateAuthNonce(walletAddress);
      
      // 2. Request user signature in MetaMask
      const signature = await requestWalletSignature(walletAddress, message);
      
      // 3. Cryptographically verify signature
      const verification = verifyWalletSignature(message, signature, walletAddress);
      if (!verification.isValid) {
        throw new Error(verification.error || 'Signature verification failed.');
      }

      // 4. Save session
      const session = saveAuthSession(walletAddress, signature, message);
      setAuthSession(session);
      
      if (addNotification) {
        addNotification(`🔐 Wallet Authenticated via Cryptographic Signature! (${shortenAddr(walletAddress)})`, 'success');
      }
    } catch (err) {
      setAuthError(err.message || 'Signature authentication failed.');
      if (addNotification) {
        addNotification(`❌ Auth Failed: ${err.message}`, 'danger');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectSession = () => {
    clearAuthSession();
    setAuthSession(null);
    if (addNotification) {
      addNotification('🔒 Wallet session locked.', 'info');
    }
  };

  const isAuthenticated = !!(authSession && authSession.address?.toLowerCase() === (walletAddress || '').toLowerCase());

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Wallet & Security Authentication</h3>
            <p className="text-[11px] text-slate-400">Signature-based session verification</p>
          </div>
        </div>

        {/* Network Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#060d18] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSwitchNetworkMode('TESTNET')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
              networkMode === 'TESTNET'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TESTNET
          </button>
          <button
            onClick={() => onSwitchNetworkMode('MAINNET')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
              networkMode === 'MAINNET'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MAINNET
          </button>
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Wallet Connection Box */}
        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Connected Wallet</span>
            {walletAddress ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MetaMask Connected
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Disconnected
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-white">
              {walletAddress ? shortenAddr(walletAddress) : 'No Wallet Connected'}
            </span>

            {!walletAddress && (
              <button
                onClick={onConnectWallet}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition"
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>

        {/* Cryptographic Session Auth Box */}
        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Signature Authentication</span>
            {isAuthenticated ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AUTH REQUIRED
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">
              {isAuthenticated ? 'Session Active (Signed Nonce)' : 'Sign Nonce to Unlock Bot'}
            </span>

            {walletAddress && !isAuthenticated && (
              <button
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Signing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" /> Sign & Authenticate
                  </>
                )}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={handleDisconnectSession}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium transition flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Lock
              </button>
            )}
          </div>
        </div>
      </div>

      {authError && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{authError}</span>
        </div>
      )}

      {/* Network Warning Banner */}
      {networkMode === 'MAINNET' ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>MAINNET MODE ACTIVE</strong> — Real cryptocurrency and gas fees will be used. Risk limits are strictly enforced.
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>TESTNET MODE (SEPOLIA)</strong> — Safe testing environment. No real funds are used.
          </span>
        </div>
      )}
    </div>
  );
};
