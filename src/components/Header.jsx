import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Bell, LogOut, Wallet, ChevronDown, Radio } from 'lucide-react';

// ── Chain ID → Network metadata map ─────────────────────────────────────────
const CHAIN_META = {
  1:        { name: 'Ethereum',       short: 'ETH',   icon: '🔷', color: 'text-indigo-400',  dot: '#6366f1' },
  56:       { name: 'BNB Chain',      short: 'BNB',   icon: '🟡', color: 'text-yellow-400', dot: '#eab308' },
  137:      { name: 'Polygon',        short: 'MATIC',  icon: '🟣', color: 'text-purple-400', dot: '#a855f7' },
  42161:    { name: 'Arbitrum',       short: 'ARB',   icon: '⚡', color: 'text-sky-400',    dot: '#38bdf8' },
  10:       { name: 'Optimism',       short: 'OP',    icon: '🔴', color: 'text-rose-400',   dot: '#f43f5e' },
  43114:    { name: 'Avalanche',      short: 'AVAX',  icon: '🔺', color: 'text-rose-400',   dot: '#ef4444' },
  250:      { name: 'Fantom',         short: 'FTM',   icon: '👻', color: 'text-blue-400',   dot: '#60a5fa' },
  8453:     { name: 'Base',           short: 'BASE',  icon: '🔵', color: 'text-blue-400',   dot: '#3b82f6' },
  100:      { name: 'Gnosis',         short: 'GNO',   icon: '🦉', color: 'text-teal-400',   dot: '#14b8a6' },
  11155111: { name: 'Sepolia',        short: 'SEP',   icon: '🧪', color: 'text-slate-400',  dot: '#94a3b8' },
  421614:   { name: 'Arb Sepolia',    short: 'ASEP',  icon: '🧪', color: 'text-slate-400',  dot: '#94a3b8' },
  80001:    { name: 'Mumbai',         short: 'MATIC', icon: '🧪', color: 'text-slate-400',  dot: '#94a3b8' },
};

const DEFAULT_CHAIN = { name: 'Not Connected', short: '—', icon: '⬡', color: 'text-slate-500', dot: '#64748b' };

export const Header = () => {
  const {
    activeTab,
    setActiveTab,
    openModal,
    logout,
    walletMode,
    setWalletMode,
    realWallet,
    user
  } = useCrypto();

  // ── Live MetaMask chain state ────────────────────────────────────────────
  const [liveChain, setLiveChain]       = useState(null);   // raw chainId number
  const [mmConnected, setMmConnected]   = useState(false);

  // Detect MetaMask chain on mount + listen to chainChanged
  useEffect(() => {
    const mm = typeof window !== 'undefined' ? window.ethereum : null;
    if (!mm) return;

    const readChain = async () => {
      try {
        const hexId = await mm.request({ method: 'eth_chainId' });
        const id    = parseInt(hexId, 16);
        setLiveChain(id);
        setMmConnected(true);
      } catch (_) {}
    };

    // Also check if already have accounts (connected)
    const checkAccounts = async () => {
      try {
        const accs = await mm.request({ method: 'eth_accounts' });
        if (accs && accs.length > 0) {
          setMmConnected(true);
          readChain();
        }
      } catch (_) {}
    };

    checkAccounts();

    const onChainChange = (hexId) => {
      setLiveChain(parseInt(hexId, 16));
      setMmConnected(true);
    };

    const onAccountsChange = (accounts) => {
      setMmConnected(accounts.length > 0);
      if (accounts.length > 0) readChain();
    };

    mm.on('chainChanged',    onChainChange);
    mm.on('accountsChanged', onAccountsChange);

    return () => {
      try {
        mm.removeListener('chainChanged',    onChainChange);
        mm.removeListener('accountsChanged', onAccountsChange);
      } catch (_) {}
    };
  }, []);

  const chain = (liveChain && CHAIN_META[liveChain]) || DEFAULT_CHAIN;
  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  // ── Page title map ───────────────────────────────────────────────────────
  const PAGE_TITLES = {
    dashboard:        'CryptoTradeWallet',
    papertrading:     'Paper Trading Terminal',
    simulation:       'Quantitative Market Simulator',
    account:          'Account Management',
    wallet:           'Institutional Wallet',
    realwallet:       'Real Wallet',
    metamaskterminal: 'MetaMask Terminal',
    contractprocess:  'Contract Process',
    banktransfer:     'Bank Transfer',
    decentralized:    'Vault Wallet',
    settings:         'System Settings',
    analytics:        'Analytics',
    strategies:       'AI Strategies',
    scanner:          'Market Scanner',
    trades:           'Trade Ledger',
    markets:          'Live Markets',
  };
  const pageTitle = PAGE_TITLES[activeTab] || 'CryptoTradeWallet';

  return (
    <header className="bg-[#080c14]/95 backdrop-blur-sm border-b border-[#4390bc]/25 px-5 sm:px-8 h-16 flex items-center justify-between gap-4 z-40 shrink-0 font-sans shadow-md">

      {/* ── LEFT: Brand + Title + Live Network Pill ── */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">

        {/* CTW Logo */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_18px_rgba(67,144,188,0.4)] hover:brightness-110 transition"
          title="Go to Dashboard"
        >
          <span className="font-black text-slate-950 text-[11px] font-mono tracking-tight">CTW</span>
        </button>

        {/* Title + Network */}
        <div className="min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white uppercase tracking-tight font-mono truncate max-w-[180px]">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4390bc]/15 text-[#8dbdd8] border border-[#68a7ca]/30 shrink-0">
              V3.8 PRO
            </span>
          </div>

          {/* Live MetaMask Network Pill */}
          {isMetaMaskInstalled ? (
            <button
              type="button"
              onClick={() => openModal('NETWORK_SWITCHER')}
              className="flex items-center gap-1.5 w-fit group"
              title="Click to switch network in MetaMask"
            >
              {/* Live pulsing dot */}
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: mmConnected ? chain.dot : '#64748b' }}
              />
              {/* Chain icon + short name */}
              <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white transition truncate max-w-[100px]">
                {mmConnected
                  ? `${chain.icon} ${chain.short}`
                  : '🦊 Not Connected'}
              </span>
              {/* Chain ID badge */}
              {mmConnected && liveChain && (
                <span className="hidden sm:inline text-[9px] font-mono text-slate-600 font-bold">
                  #{liveChain}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-[#68a7ca] transition shrink-0" />
            </button>
          ) : (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition"
              title="Install MetaMask"
            >
              <span>🦊</span>
              <span>Install MetaMask</span>
            </a>
          )}
        </div>
      </div>

      {/* ── CENTER: Search Bar ── */}
      <div className="relative hidden md:flex flex-1 max-w-xs mx-2">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search coins, orders, addresses..."
          className="w-full bg-[#0d1420] border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-[11px] text-slate-200 placeholder-slate-500 outline-none focus:border-[#68a7ca]/60 transition font-mono"
        />
      </div>

      {/* ── RIGHT: Controls Cluster ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Wallet Mode Toggle */}
        <button
          onClick={() => {
            if (walletMode === 'DEMO') {
              if (realWallet?.connected) setWalletMode('REAL');
              else openModal('WALLET');
            } else {
              setWalletMode('DEMO');
            }
          }}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition cursor-pointer shrink-0 ${
            walletMode === 'REAL'
              ? 'bg-[#00e676]/8 text-[#00e676] border-[#00e676]/35 shadow-[0_0_12px_rgba(0,230,118,0.12)]'
              : 'bg-amber-500/8 text-amber-300 border-amber-500/35'
          }`}
          title="Toggle Demo / Real Web3"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${walletMode === 'REAL' ? 'bg-[#00e676] animate-pulse' : 'bg-amber-400'}`} />
          <span className="uppercase whitespace-nowrap">
            {walletMode === 'REAL'
              ? (realWallet?.connected ? realWallet.shortAddress : 'REAL WEB3')
              : 'DEMO'}
          </span>
        </button>

        {/* Deposit Button */}
        <button
          onClick={() => openModal('DEPOSIT')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-[11px] font-mono shadow-[0_0_18px_rgba(67,144,188,0.3)] hover:brightness-110 transition cursor-pointer shrink-0"
        >
          <Wallet className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">+ DEPOSIT</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => openModal('NOTIFICATIONS')}
          className="relative p-2 rounded-xl bg-[#0d1420] border border-slate-800/80 text-slate-400 hover:text-[#8dbdd8] transition shrink-0"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
        </button>

        {/* User Avatar */}
        <button
          onClick={() => setActiveTab('account')}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4390bc] to-[#8dbdd8] text-slate-950 font-black font-mono text-[11px] flex items-center justify-center shadow-md hover:brightness-110 transition shrink-0"
          title={user?.name || 'Account'}
        >
          {user?.avatarInitials || (user?.name?.charAt(0)?.toUpperCase() || 'D')}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl bg-[#0d1420] border border-slate-800/80 text-slate-400 hover:text-rose-400 transition shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};
