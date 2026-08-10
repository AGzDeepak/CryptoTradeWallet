import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Mail, Bell, Bot, LogOut, Wallet, ChevronDown, Globe, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { 
    activeTab,
    setActiveTab,
    autoTradingEnabled, 
    setAutoTradingEnabled, 
    openModal, 
    logout,
    walletMode,
    setWalletMode,
    realWallet,
    realWalletNetwork,
    user
  } = useCrypto();

  const getTitle = () => {
    switch (activeTab) {
      case 'papertrading': return 'Paper Trading Terminal';
      case 'simulation': return 'Quantitative Market Simulator';
      case 'account': return 'Account Management';
      case 'wallet': return 'Institutional Wallet';
      case 'news': return 'Live Crypto Intelligence';
      case 'settings': return 'System Settings';
      default: return 'CryptoTradeWallet';
    }
  };

  const getNetworkIcon = () => {
    const net = (realWalletNetwork || '').toLowerCase();
    if (net.includes('bitcoin')) return '₿';
    if (net.includes('sepolia')) return '🧪';
    if (net.includes('arbitrum')) return '⚡';
    if (net.includes('polygon')) return '🟣';
    return 'Ξ';
  };

  return (
    <header className="bg-[#080c14] border-b border-[#4390bc]/30 px-4 sm:px-8 h-20 flex items-center justify-between gap-4 z-40 shrink-0 font-sans shadow-lg">
      
      {/* LEFT: Title & Active Network Badge */}
      <div className="flex items-center space-x-3 shrink-0">
        <div 
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_20px_rgba(67,144,188,0.4)] cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
          title="CryptoTradeWallet Dashboard"
        >
          <span className="font-extrabold text-slate-950 text-base font-mono">CTW</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight font-mono uppercase">
              {getTitle()}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4390bc]/20 text-[#8dbdd8] border border-[#68a7ca]/40">
              V3.8 PRO
            </span>
          </div>

          {/* Connected Network Pill */}
          <button
            type="button"
            onClick={() => openModal('NETWORK_SWITCHER')}
            className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-[#8dbdd8] hover:text-white transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse shrink-0" />
            <span className="text-xs">{getNetworkIcon()}</span>
            <span className="truncate max-w-[150px] uppercase">
              {realWalletNetwork ? realWalletNetwork.replace(' Mainnet', '').replace(' Testnet', '') : 'Ethereum'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#68a7ca]" />
          </button>
        </div>
      </div>

      {/* CENTER: Search Bar */}
      <div className="relative hidden md:block flex-1 max-w-sm mx-4">
        <input
          type="text"
          placeholder="Search BTC, ETH, transactions, orders..."
          className="w-full bg-[#0d1420] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-[#68a7ca] transition shadow-inner font-mono"
        />
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
      </div>

      {/* RIGHT: Consolidated Clean Controls Cluster */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Wallet Mode Badge Button */}
        <button
          onClick={() => {
            if (walletMode === 'DEMO') {
              if (realWallet.connected) setWalletMode('REAL');
              else openModal('WALLET');
            } else {
              setWalletMode('DEMO');
            }
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer shrink-0 ${
            walletMode === 'REAL'
              ? 'bg-[#00e676]/10 text-[#00e676] border-[#00e676]/40 shadow-[0_0_15px_rgba(0,230,118,0.2)]'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/40'
          }`}
          title="Click to toggle Demo vs Real Web3 Wallet"
        >
          <span className={`w-2 h-2 rounded-full ${walletMode === 'REAL' ? 'bg-[#00e676] animate-pulse' : 'bg-amber-400'}`} />
          <span className="uppercase">
            {walletMode === 'REAL' ? (realWallet.connected ? realWallet.shortAddress : 'REAL WEB3') : 'DEMO MODE'}
          </span>
        </button>

        {/* Deposit / Pay Action Button */}
        <button
          onClick={() => openModal('DEPOSIT')}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-xs font-mono shadow-[0_0_20px_rgba(67,144,188,0.35)] hover:brightness-110 transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <Wallet className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
          <span className="whitespace-nowrap">+ DEPOSIT / PAY</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => openModal('NOTIFICATIONS')}
          className="relative p-2.5 rounded-xl bg-[#0d1420] border border-slate-800 text-slate-300 hover:text-[#8dbdd8] transition shrink-0"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => setActiveTab('account')}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4390bc] to-[#8dbdd8] text-slate-950 font-black font-mono text-xs cursor-pointer shadow-md hover:brightness-110 transition flex items-center justify-center shrink-0"
          title={user?.name || 'Account Profile'}
        >
          {user?.avatarInitials || (user?.name?.charAt(0)?.toUpperCase() || 'D')}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-[#0d1420] border border-slate-800 text-slate-400 hover:text-rose-400 transition shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
