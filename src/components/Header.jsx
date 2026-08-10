import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Bell, LogOut, Wallet, ChevronDown } from 'lucide-react';

export const Header = () => {
  const { 
    activeTab,
    setActiveTab,
    openModal, 
    logout,
    walletMode,
    setWalletMode,
    realWallet,
    realWalletNetwork,
    user
  } = useCrypto();

  const getTitle = () => {
    const map = {
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
    return map[activeTab] || 'CryptoTradeWallet';
  };

  const getNetworkLabel = () => {
    if (!realWalletNetwork) return 'Ethereum';
    return realWalletNetwork
      .replace('-mainnet', '')
      .replace('-testnet', '')
      .replace('ethereum', 'ETH')
      .replace('bitcoin', 'BTC')
      .replace('arbitrum', 'ARB')
      .replace('polygon', 'MATIC')
      .replace('bsc', 'BSC')
      .toUpperCase();
  };

  const getNetworkIcon = () => {
    const net = (realWalletNetwork || '').toLowerCase();
    if (net.includes('bitcoin'))  return '₿';
    if (net.includes('sepolia'))  return '🧪';
    if (net.includes('arbitrum')) return '⚡';
    if (net.includes('polygon'))  return '🟣';
    if (net.includes('bsc'))      return '🟡';
    return 'Ξ';
  };

  return (
    <header className="bg-[#080c14]/95 backdrop-blur-sm border-b border-[#4390bc]/25 px-5 sm:px-8 h-16 flex items-center justify-between gap-4 z-40 shrink-0 font-sans shadow-md">

      {/* LEFT: Brand + Title + Network */}
      <div className="flex items-center gap-4 shrink-0 min-w-0">
        {/* CTW Emblem */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_18px_rgba(67,144,188,0.4)] hover:brightness-110 transition"
          title="Dashboard"
        >
          <span className="font-black text-slate-950 text-[11px] font-mono tracking-tight">CTW</span>
        </button>

        {/* Title + Network pill */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white uppercase tracking-tight font-mono truncate max-w-[200px]">
              {getTitle()}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4390bc]/15 text-[#8dbdd8] border border-[#68a7ca]/35 shrink-0">
              V3.8 PRO
            </span>
          </div>
          <button
            type="button"
            onClick={() => openModal('NETWORK_SWITCHER')}
            className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#8dbdd8] hover:text-white transition cursor-pointer mt-0.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span>{getNetworkIcon()}</span>
            <span className="truncate max-w-[120px]">{getNetworkLabel()}</span>
            <ChevronDown className="w-3 h-3 text-[#68a7ca] shrink-0" />
          </button>
        </div>
      </div>

      {/* CENTER: Search */}
      <div className="relative hidden md:flex flex-1 max-w-xs mx-2">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search BTC, ETH, orders..."
          className="w-full bg-[#0d1420] border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-[11px] text-slate-200 placeholder-slate-500 outline-none focus:border-[#68a7ca]/60 transition font-mono"
        />
      </div>

      {/* RIGHT: Controls */}
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
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition cursor-pointer shrink-0 ${
            walletMode === 'REAL'
              ? 'bg-[#00e676]/8 text-[#00e676] border-[#00e676]/35 shadow-[0_0_12px_rgba(0,230,118,0.15)]'
              : 'bg-amber-500/8 text-amber-300 border-amber-500/35'
          }`}
          title="Toggle Demo / Real Web3"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${walletMode === 'REAL' ? 'bg-[#00e676] animate-pulse' : 'bg-amber-400'}`} />
          <span className="uppercase whitespace-nowrap">
            {walletMode === 'REAL' ? (realWallet?.connected ? realWallet.shortAddress : 'REAL WEB3') : 'DEMO'}
          </span>
        </button>

        {/* Deposit Button */}
        <button
          onClick={() => openModal('DEPOSIT')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-[11px] font-mono shadow-[0_0_18px_rgba(67,144,188,0.3)] hover:brightness-110 transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <Wallet className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="hidden sm:inline">+ DEPOSIT</span>
          <span className="sm:hidden">+</span>
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
