import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  ShieldCheck, Key, Copy, Check, LogOut, Zap, RefreshCw,
  CheckCircle2, LogIn, Globe, Activity, Lock, User, Wifi
} from 'lucide-react';
import { AddApiKeyModal } from './AddApiKeyModal';
import { shortAddress, fetchEthBalance, switchToEthereumMainnet, switchToSepoliaTestnet } from '../services/walletService';
import { NetworkSwitcherModal } from './NetworkSwitcherModal';

export const AccountSection = () => {
  const {
    user,
    openModal,
    addNotification,
    logout,
    realWalletAddress,
    setRealWalletAddress,
    realWalletNetwork,
    setRealWalletNetwork,
    switchRealWalletAccount,
    setActiveTab
  } = useCrypto();

  const [showNetworkModal, setShowNetworkModal]     = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen]   = useState(false);
  const [copiedAddr, setCopiedAddr]                 = useState(false);
  const [isConnecting, setIsConnecting]             = useState(false);
  const [ethBalance, setEthBalance]                 = useState('0.000000');

  // ── Live balance sync ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      if (!realWalletAddress) return;
      try {
        const bal = await fetchEthBalance(realWalletAddress, 'sepolia');
        if (mounted && bal !== undefined) setEthBalance(bal.toFixed(6));
      } catch (_) {}
    };
    sync();
    const id = setInterval(sync, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, [realWalletAddress]);

  // ── Connect MetaMask ───────────────────────────────────────────────
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          const addr = accounts[0];
          setRealWalletAddress(addr);
          const hexId  = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(hexId, 16);
          const netMap = {
            1: 'Ethereum Mainnet', 56: 'BNB Smart Chain', 137: 'Polygon Mainnet',
            42161: 'Arbitrum One', 10: 'Optimism', 11155111: 'Sepolia Testnet',
          };
          setRealWalletNetwork(netMap[chainId] || 'Ethereum Mainnet');
          addNotification(`🦊 MetaMask Connected: ${addr.substring(0, 10)}...`, 'success');
        }
      } else {
        const inputAddr = window.prompt('MetaMask not detected. Paste your 0x address:');
        if (inputAddr?.startsWith('0x')) {
          setRealWalletAddress(inputAddr);
          addNotification(`✅ Wallet connected: ${inputAddr.substring(0, 10)}...`, 'success');
        }
      }
    } catch (err) {
      addNotification(`MetaMask: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Switch Account ─────────────────────────────────────────────────
  const handleSwitch = async () => {
    setIsConnecting(true);
    try {
      if (switchRealWalletAccount) {
        await switchRealWalletAccount();
      } else if (window.ethereum) {
        await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          setRealWalletAddress(accounts[0]);
          addNotification(`🔄 Switched to: ${accounts[0].substring(0, 10)}...`, 'success');
        }
      }
    } catch (err) {
      addNotification(`Switch: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setRealWalletAddress('');
    addNotification('MetaMask disconnected.', 'info');
  };

  const copyAddress = () => {
    if (!realWalletAddress) return;
    navigator.clipboard.writeText(realWalletAddress).catch(() => {});
    setCopiedAddr(true);
    addNotification(`Address copied: ${realWalletAddress.substring(0, 10)}...`, 'info');
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const isConnected = !!realWalletAddress;

  // ── Info rows helper ───────────────────────────────────────────────
  const InfoRow = ({ label, value, accent = 'text-white' }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-800/60 last:border-0">
      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide shrink-0">{label}</span>
      <span className={`text-[11px] font-mono font-bold text-right break-all ${accent}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">

      {/* ══════════════════════════════════════════════════════
          ZONE 1 — PROFILE HERO CARD
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1422] via-[#0b0c10] to-[#09101d] border border-[#68a7ca]/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Left: Avatar + Identity */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-3xl shadow-[0_0_28px_rgba(245,158,11,0.35)]">
              🦊
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono uppercase">
                  {isConnected ? `MetaMask (${shortAddress(realWalletAddress)})` : 'MetaMask Web3 Account'}
                </h2>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-black border shrink-0 ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-amber-950/60 text-amber-400 border-amber-700/50'
                }`}>
                  {isConnected ? '🟢 CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>

              {isConnected ? (
                <p className="text-[11px] font-mono text-slate-400 break-all leading-relaxed">
                  <span className="text-amber-400 font-bold">ADDRESS:</span>{' '}
                  <span className="text-white">{realWalletAddress}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono">No MetaMask address linked — connect below</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-[#2dd4bf] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  EIP-1193 NON-CUSTODIAL
                </span>
                {isConnected && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400">
                      Balance: <strong className="text-amber-400">{ethBalance} ETH</strong>
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400">
                      Network: <strong className="text-[#68a7ca]">{realWalletNetwork || 'Ethereum'}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isConnected ? (
              <>
                <button onClick={copyAddress}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:brightness-110 transition shadow">
                  {copiedAddr ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedAddr ? 'COPIED!' : 'COPY ADDRESS'}
                </button>
                <button onClick={handleSwitch} disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition">
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                  SWITCH ACCOUNT
                </button>
                <button onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/60 text-rose-400 font-bold text-xs transition">
                  <LogOut className="w-3.5 h-3.5" />
                  DISCONNECT
                </button>
              </>
            ) : (
              <button onClick={handleConnect} disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <LogIn className="w-4 h-4" />
                {isConnecting ? 'CONNECTING...' : '🦊 CONNECT METAMASK'}
              </button>
            )}
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 font-bold text-xs transition">
              <LogOut className="w-3.5 h-3.5" />
              SIGN OUT
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ZONE 2 — MetaMask Account Details (Connected State)
      ══════════════════════════════════════════════════════ */}
      {isConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Card A: Wallet Info */}
          <div className="rounded-2xl bg-[#080d16] border border-emerald-500/25 p-6 space-y-1 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center">
                <Wifi className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-tight">Wallet Info</div>
                <div className="text-[10px] text-emerald-400 font-bold">Live On-Chain</div>
              </div>
            </div>
            <InfoRow label="Address" value={shortAddress(realWalletAddress)} accent="text-emerald-400" />
            <InfoRow label="Network" value={realWalletNetwork || 'Ethereum Mainnet'} accent="text-[#68a7ca]" />
            <InfoRow label="Gas Balance" value={`${ethBalance} ETH`} accent="text-amber-400" />
            <InfoRow label="Protocol" value="EIP-1193 Direct" accent="text-[#2dd4bf]" />
          </div>

          {/* Card B: Network Control */}
          <div className="rounded-2xl bg-[#080d16] border border-slate-800 p-6 space-y-1 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#68a7ca]" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-tight">Network Control</div>
                <div className="text-[10px] text-slate-500 font-bold">Switch MetaMask Chain</div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              {[
                { label: '🌐 Ethereum Mainnet', action: async () => { await switchToEthereumMainnet(); setRealWalletNetwork('Ethereum Mainnet'); addNotification('🌐 Switched to Ethereum Mainnet!', 'success'); }, style: 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-700/50 text-indigo-300' },
                { label: '🧪 Sepolia Testnet',  action: async () => { await switchToSepoliaTestnet();  setRealWalletNetwork('Sepolia Testnet');  addNotification('🧪 Switched to Sepolia Testnet!',  'success'); }, style: 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-700 text-slate-300' },
                { label: '⚙️ All Networks',     action: () => setShowNetworkModal(true),                                                                                                                                   style: 'bg-[#4390bc]/10 hover:bg-[#4390bc]/20 border-[#68a7ca]/30 text-[#8dbdd8]' },
              ].map(({ label, action, style }) => (
                <button key={label} onClick={async () => { try { await action(); } catch (err) { addNotification(err.message, 'warning'); } }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border font-bold text-xs transition ${style}`}>
                  <span>{label}</span>
                  <span className="text-[10px] opacity-60">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card C: Security */}
          <div className="rounded-2xl bg-[#080d16] border border-slate-800 p-6 space-y-1 shadow-lg">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#2dd4bf]" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-tight">Security</div>
                <div className="text-[10px] text-slate-500 font-bold">Non-Custodial Protocol</div>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {[
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, label: 'Keys in MetaMask locally' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, label: 'No private key exposure' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, label: 'EIP-1193 provider standard' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, label: 'Approval prompts in browser' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, label: '256-bit AES encrypted store' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <button onClick={() => setActiveTab('metamaskterminal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-xs hover:brightness-110 transition shadow">
                <Zap className="w-3.5 h-3.5" />
                OPEN METAMASK TERMINAL
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ══ NOT CONNECTED — Big CTA Card ══ */
        <div className="rounded-3xl bg-[#080d16] border border-amber-500/25 p-10 flex flex-col items-center justify-center gap-5 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(245,158,11,0.3)]">
            🦊
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">MetaMask Not Connected</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect your MetaMask extension to enable live Web3 trading, on-chain balance tracking, network switching, and Solidity contract deployments.
            </p>
          </div>
          <button onClick={handleConnect} disabled={isConnecting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm uppercase shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:brightness-110 transition">
            <LogIn className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask Now'}
          </button>
          <p className="text-[10px] text-slate-600 font-mono">Non-custodial · EIP-1193 · Keys never leave your browser</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ZONE 3 — Profile & Session Info (Bottom Strip)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* User Profile Info */}
        <div className="rounded-2xl bg-[#080d16] border border-slate-800 p-6 space-y-1">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4390bc] to-[#8dbdd8] flex items-center justify-center">
              <User className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-tight">User Profile</div>
              <div className="text-[10px] text-slate-500 font-bold">Platform Account</div>
            </div>
          </div>
          <InfoRow label="Name"   value={user?.name  || 'Deepak Kumar'}              accent="text-white" />
          <InfoRow label="Email"  value={user?.email || 'deepak@chainblock.io'}       accent="text-[#68a7ca]" />
          <InfoRow label="Role"   value={user?.role  || 'Institutional Quant Trader'} accent="text-slate-300" />
          <InfoRow label="Status" value={user?.secStatus || '256-BIT ENCRYPTED'}      accent="text-emerald-400" />
        </div>

        {/* Session & App Info */}
        <div className="rounded-2xl bg-[#080d16] border border-slate-800 p-6 space-y-1">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#68a7ca]" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-tight">Session Info</div>
              <div className="text-[10px] text-slate-500 font-bold">Platform Status</div>
            </div>
          </div>
          <InfoRow label="Platform"      value="CryptoTradeWallet V3.8 PRO"  accent="text-white" />
          <InfoRow label="Wallet Mode"   value={isConnected ? 'REAL WEB3' : 'DEMO MODE'} accent={isConnected ? 'text-emerald-400' : 'text-amber-400'} />
          <InfoRow label="Security"      value="TLS 1.3 + AES-256"           accent="text-[#2dd4bf]" />
          <InfoRow label="Session"       value="ACTIVE"                       accent="text-emerald-400" />
        </div>

      </div>

      {/* Modals */}
      {isApiKeyModalOpen && <AddApiKeyModal onClose={() => setIsApiKeyModalOpen(false)} />}
      <NetworkSwitcherModal isOpen={showNetworkModal} onClose={() => setShowNetworkModal(false)} />

    </div>
  );
};
