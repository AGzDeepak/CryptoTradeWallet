import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Mail, Bell, Bot, LogOut, CreditCard } from 'lucide-react';

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
    user
  } = useCrypto();

  const getTitle = () => {
    switch (activeTab) {
      case 'papertrading': return 'Paper Trading Terminal';
      case 'simulation': return 'Quantitative Market Simulator';
      case 'account': return 'Account Management';
      case 'wallet': return 'Institutional Wallet';
      case 'news': return 'Live Crypto News & Intelligence';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-[#0b0c10] border-b border-slate-800/80 px-6 sm:px-8 h-20 flex items-center justify-between gap-6 z-40 shrink-0 font-sans">
      
      {/* Left: Dynamic Header Title & Mobile Brand Icon */}
      <div className="flex items-center shrink-0 mr-2 space-x-3">
        {/* Mobile Brand emblem icon (visible on mobile/tablet) */}
        <div 
          className="lg:hidden w-8 h-8 rounded-full bg-[#facc15] flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.4)] cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-5 h-5 rounded-full bg-[#0b0c10] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
          </div>
        </div>

        <h1 className="text-base sm:text-2xl font-extrabold text-[#facc15] tracking-tight whitespace-nowrap">
          {getTitle()}
        </h1>
      </div>

      {/* Center: Search Bar */}
      <div className="relative hidden md:block flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Search coins, transactions, orders..."
          className="w-full bg-[#181a20] border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-[#facc15] transition shadow-inner"
        />
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
      </div>

      {/* Right: Controls Cluster */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Master Bot Autopilot Pill */}
        <button
          onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
          className={`hidden xl:flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono border transition whitespace-nowrap shrink-0 ${
            autoTradingEnabled
              ? 'bg-amber-950/80 text-[#facc15] border-[#facc15]/50 glow-yellow'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <Bot className={`w-4 h-4 ${autoTradingEnabled ? 'text-[#facc15]' : 'text-slate-500'}`} />
          <span className="whitespace-nowrap">AUTOPILOT: {autoTradingEnabled ? 'ON' : 'PAUSED'}</span>
        </button>

        {/* Dual Wallet Switcher */}
        <div className="hidden sm:flex items-center bg-[#181a20] p-1 rounded-xl border border-slate-800 text-xs font-mono shrink-0 whitespace-nowrap">
          <button
            onClick={() => setWalletMode('DEMO')}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              walletMode === 'DEMO'
                ? 'bg-[#facc15] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DEMO
          </button>
          <button
            onClick={() => {
              if (realWallet.connected) setWalletMode('REAL');
              else openModal('WALLET');
            }}
            className={`px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap ${
              walletMode === 'REAL'
                ? 'bg-[#facc15] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {realWallet.connected ? realWallet.shortAddress : 'REAL WEB3'}
          </button>
        </div>

        {/* Real Payment Gateway Action Button */}
        <button
          onClick={() => openModal('DEPOSIT')}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#facc15] to-amber-500 text-slate-950 font-extrabold text-xs font-mono shadow-lg hover:brightness-110 transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <CreditCard className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="whitespace-nowrap">+ DEPOSIT / PAY</span>
        </button>

        {/* Mail Icon */}
        <button 
          onClick={() => openModal('AI_SUPPORT')}
          className="p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-300 hover:text-[#facc15] transition shrink-0"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => openModal('NOTIFICATIONS')}
          className="relative p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-300 hover:text-[#facc15] transition shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#facc15]"></span>
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => setActiveTab('account')}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#facc15] to-[#2dd4bf] text-slate-950 font-extrabold font-mono text-xs cursor-pointer shadow-md hover:brightness-110 transition flex items-center justify-center shrink-0"
          title={user?.name || 'Account Profile'}
        >
          {user?.avatarInitials || (user?.name?.charAt(0)?.toUpperCase() || 'D')}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-400 hover:text-rose-400 transition shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
